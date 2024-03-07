var express = require('express');
var router = express.Router();

const {mistral} = require('../modules/mistral.js')

router.post('/mistral', async (req, res, next) => {

  const { assistants, input } = req.body

  let results = {}

  try {
      
      for (const assistant of assistants) {
           
          results[assistant] = await mistral(assistant, input);
          
        }

      res.json({ results });

  } catch (error) {
      next(error);
  }
});


module.exports = router;
