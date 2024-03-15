var express = require('express');
var router = express.Router();

const {mistral} = require('../modules/mistral.js')
const {openai} = require('../modules/openai.js')


router.post('/mistral/:assistant', async (req, res, next) => {

  const { input } = req.body
  const { assistant } = req.params

  try {
      
      const result = await mistral(assistant, input);
        
      res.json(result);

  } catch (error) {
      next(error);
  }
});


router.post('/openai/:assistant', async (req, res, next) => {
  const { input } = req.body;
  const { assistant } = req.params;

  try {

    const result = await openai(assistant, input);
    
    const filteredResults = result[assistant].filter(item => item.importance > 8);
    
    const filteredResponse = { [assistant]: filteredResults };
    
    res.json(filteredResponse);

  } catch (error) {
    next(error);
  }
});

module.exports = router;