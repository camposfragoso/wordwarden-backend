const path = require('path');

let LlamaModel, LlamaGrammar, LlamaContext, LlamaChatSession, LlamaJsonSchemaGrammar;

async function mistral(taskType, input) {

    const prompts = {
        devilsAdvocate: `You're an assistant tasked with writing a text analysis in the form of a JSON file. Each entry should include 'excerpt', 'proposition', and 'importance'. For 'excerpt', directly quote the text, ensuring accuracy and no alterations. For 'proposition', create a counterpoint or alternative perspective, designed to stimulate critical thinking. For 'importance', assign a numerical value reflecting the proposition's significance. Ensure all excerpts are exact, direct quotes from the provided text.`,
        summarizer: `You're an assistant tasked with writing a text analysis in the form of a JSON file. Each entry should include 'excerpt', 'proposition', and 'importance'. For 'excerpt', include the exact text of the sentence without any alterations. For 'proposition', distill the essential message of the sentence into a clear, concise summary that maintains the original meaning. Aim to simplify the sentence's complexity and verbosity, providing a straightforward, accessible summary. For 'importance', assign a numerical value that reflects the summary's significance in the broader context of the text. Ensure the 'proposition' is a coherent, concise summary that encapsulates the key points while remaining true to the original context.`

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
