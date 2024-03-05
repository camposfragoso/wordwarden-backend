var express = require('express');
var router = express.Router();

const {mistral} = require('../modules/mistral')

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/mistral', async (req, res, next) => {
  try {
      const devil = await mistral('devilsAdvocate', req.body.answer);
      const sum = await mistral('summarizer', req.body.answer);
      res.json({ devil, sum });
  } catch (error) {
      next(error);
  }
});


module.exports = router;
