const path = require('path');

let LlamaModel, LlamaGrammar, LlamaContext, LlamaChatSession, LlamaJsonSchemaGrammar;

async function mistral(taskType, input) {

    const prompts = {
        devilsAdvocate: `You're an assistant tasked with writing a text analysis in the form of a JSON file. Each entry should include 'excerpt', 'proposition', and 'importance'. For 'excerpt', directly quote the text, ensuring accuracy and no alterations. For 'proposition', create a counterpoint or alternative perspective, designed to stimulate critical thinking. For 'importance', assign a numerical value reflecting the proposition's significance. This numerical value should range from 1 to 10. Ensure all excerpts are exact, direct quotes from the provided text.`,
        summarizer: `You are an assistant tasked with analyzing a text provided by the user. Your objective is to evaluate each sentence for complexity and verbosity. Create a JSON object where each entry corresponds to a sentence from the text, structured with two key components: 'excerpt' and 'proposition'. For the 'excerpt' key, include the exact text of the sentence. For the 'proposition' key, provide a simplified version of the sentence that reduces its complexity and verbosity while maintaining the original meaning. This simplification should serve as a direct, actionable suggestion to help the user make their text clearer and more accessible. For 'importance', assign a numerical value reflecting the proposition's significance. This numerical value should range from 1 to 10.`,
        elaborator: `You're an assistant tasked with writing a text analysis in the form of a JSON file. Each entry should include 'sentence', 'elaboration', and 'importance'. For 'sentence', directly quote the text, focusing on sentences that are brief or lacking in detail. For 'elaboration', provide a more developed and comprehensive version of the sentence, adding depth and context to enrich the reader's understanding. For 'importance', assign a numerical value reflecting the proposition's significance. This numerical value should range from 1 to 10.  Ensure the 'elaboration' offers a meaningful expansion on the original sentence.`
    };

    const selectedPrompt = prompts[taskType];

    if (!selectedPrompt) {
        throw new Error('Invalid task type specified');
    }

	if (!LlamaModel || !LlamaGrammar || !LlamaContext || !LlamaChatSession || !LlamaJsonSchemaGrammar || !LlamaChatPromptWrapper) {
        const llama = await import('node-llama-cpp');
        LlamaModel = llama.LlamaModel;
        LlamaGrammar = llama.LlamaGrammar;
        LlamaContext = llama.LlamaContext;
        LlamaChatSession = llama.LlamaChatSession;
        LlamaJsonSchemaGrammar = llama.LlamaJsonSchemaGrammar;
        LlamaChatPromptWrapper = llama.LlamaChatPromptWrapper;
      }
    
      const model = new LlamaModel({
        modelPath: path.join(__dirname, "..", "llm", "capybarahermes-2.5-mistral-7b.Q4_K_M.gguf"),
        /* temperature: 0.7 */
      });

      const grammar = new LlamaJsonSchemaGrammar({
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "excerpt": {
                    "type": "string"
                },
                "proposition": {
                    "type": "string"
                },
                "importance": {
                    "type": "string"
                }
            },
            "required": ["excerpt", "proposition", "importance"],
            "additionalProperties": false
        }
    });
    


      const context = new LlamaContext({ model, batchSize: 4096 });
    
        class MyCustomChatPromptWrapper extends LlamaChatPromptWrapper {
        constructor() {
            super();
            this.wrapperName = "WordWarden";
          }
    
        wrapPrompt(prompt) {
           
          return `SYSTEM: ${selectedPrompt} \n USER: ${prompt} \n ASSISTANT:`;
        }
    
        getStopStrings() {
            return ["USER:"];
        }
    
        getDefaultStopString() {
            return "USER:";
        }
    }
    
    const session = new LlamaChatSession({
        context,
        promptWrapper: new MyCustomChatPromptWrapper()
    });
    
      const answer = await session.prompt(input, {
          grammar,
          maxTokens: context.getContextSize(),
      });
    
        try {
            const parsedAnswer = JSON.parse(answer);
            return parsedAnswer;
        } catch (error) {
            return 'Error parsing JSON: ' + error
        }
    
  }

module.exports = { mistral };
