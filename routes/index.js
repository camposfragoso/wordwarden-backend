var express = require('express');
var router = express.Router();

const {mistral} = require('../modules/mistral')

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/mistral', async (req, res, next) => {
  try {
      const result = await mistral(req.body.answer);
      res.json(result);
  } catch (error) {
      next(error);
  }
});

module.exports = router;
