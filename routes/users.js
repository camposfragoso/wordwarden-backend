var express = require('express');
const { checkBody } = require("../modules/checkbody");
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const User = require("../models/users")
require("../models/connection")

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//POST : signup
router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['email', 'username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: req.body.username, email : req.body.email }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        fieldOfWork : req.body.fieldOfWork,
        email : req.body.email,
        password: hash,
        token: uid2(32),
        defaultActiveAssistants : req.body.defaultActiveAssistants

      });

      newUser.save().then((data) => {
        res.json({ result: true, user: data });
      });
    } else{
      res.json({ result: false, error: 'User already exists' });
    }
  });
});


//POST : LOGIN

router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: req.body.username }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token, firstname: data.firstname });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});


//

module.exports = router;
