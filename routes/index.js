var express = require('express');
var router = express.Router();
const path = require('path');

// Use dynamic import to load the ES module
let LlamaModel, LlamaGrammar, LlamaContext, LlamaChatSession, LlamaJsonSchemaGrammar;

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/mistral', async (req, res, next) => {
  
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

  const grammar = await LlamaGrammar.getFor("json");

  const context = new LlamaContext({ model });

	class MyCustomChatPromptWrapper extends LlamaChatPromptWrapper {
    constructor() {
        super();
        this.wrapperName = "WordWarden";
				this.devilPrompt = `You're an assistant writing a text alongside the user. Your task is to analyze the text provided by the user and create a JSON file where each entry is structured with two key components: 'excerpt' and 'proposition'. For each entry, the 'excerpt' key should contain a direct quote from the text, and the 'proposition' key should contain a devil's advocate proposition that challenges or offers an alternative viewpoint to the idea presented in the excerpt. The proposition should be thought-provoking, encouraging a deeper examination of the subject matter, and articulated clearly as a standalone sentence.`;
				this.devilPromptTIPTAP = `You're an assistant analyzing a text provided in a structured format, where each paragraph is separated into individual entries. Your task is to parse through each entry, identify key excerpts, and create a JSON file where each entry is structured with two key components: 'excerpt' and 'proposition'. For each entry, the 'excerpt' key should contain a direct quote from the text, and the 'proposition' key should contain a devil's advocate proposition that challenges or offers an alternative viewpoint to the idea presented in the excerpt. The proposition should be thought-provoking, encouraging a deeper examination of the subject matter, and articulated clearly as a standalone sentence.`			
			}

    wrapPrompt(prompt) {
       
      return `SYSTEM: ${this.devilPromptTIPTAP} \n USER: ${prompt} \n ASSISTANT:`;

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

	const text = req.body.answer;

  const answer = await session.prompt(text, {
      grammar,
      maxTokens: context.getContextSize()
  });

	try {
		const parsedAnswer = JSON.parse(answer);
		console.log('Parsed answer:', parsedAnswer);
		res.json(parsedAnswer);
	} catch (error) {
		console.error('Error parsing JSON:', error);
		// Handle the error appropriately
		res.status(500).send('An error occurred while parsing JSON');
	}});


module.exports = router;
