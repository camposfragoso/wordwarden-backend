var express = require('express');
var router = express.Router();

const {mistral} = require('../modules/mistral.js')

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


module.exports = router;