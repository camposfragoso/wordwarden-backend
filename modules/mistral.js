const path = require('path');

let LlamaModel, LlamaGrammar, LlamaContext, LlamaChatSession, LlamaJsonSchemaGrammar;

async function mistral(taskType, input) {

    const prompts = {
        devilsAdvocate: `You're an assistant writing a text alongside the user. Your task is to analyze the text provided by the user and create a JSON file where each entry is structured with two key components: 'excerpt' and 'proposition'. For each entry, the 'excerpt' key should contain a direct quote from the text, and the 'proposition' key should contain a devil's advocate proposition that challenges or offers an alternative viewpoint to the idea presented in the excerpt. The proposition should be thought-provoking, encouraging a deeper examination of the subject matter, and articulated clearly as a standalone sentence.`,
        summarizer: `You are an assistant tasked with analyzing a text provided by the user. Your objective is to evaluate each sentence for complexity and verbosity. Create a JSON object where each entry corresponds to a sentence from the text, structured with two key components: 'excerpt' and 'proposition'. For the 'excerpt' key, include the exact text of the sentence. For the 'proposition' key, provide a simplified version of the sentence that reduces its complexity and verbosity while maintaining the original meaning. This simplification should serve as a direct, actionable suggestion to help the user make their text clearer and more accessible.`
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
        modelPath: path.join(__dirname, "..", "llm", "capybarahermes-2.5-mistral-7b.Q4_K_M.gguf")
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
                }
            },
            "required": ["excerpt", "proposition"],
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
            console.log('Parsed answer:', parsedAnswer);
            return parsedAnswer;
        } catch (error) {
            return 'Error parsing JSON: ' + error
        }
    
  }

module.exports = { mistral };
