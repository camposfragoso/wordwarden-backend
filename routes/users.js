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
  if (!checkBody(req.body, ['email', 'password', "lastName","firstName"])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({email : req.body.email }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        firstName: req.body.firstName,
        lastName : req.body.lastName,
        fieldOfWork : req.body.fieldOfWork,
        email : req.body.email,
        password: hash,
        token: uid2(32),
        defaultActiveAssistants : req.body.defaultActiveAssistants

      });

      newUser.save().then(() => {
        res.json({ result: true, user: newUser });
      });
    } else{
      res.json({ result: false, error: 'User already exists' });
    }
  });
});


//POST : LOGIN

router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: req.body.username }).then(data => {
    if(data===null){
      res.json({result:false, error:"user not found"})
    }else{

      if (bcrypt.compareSync(req.body.password, data.password)) {
        res.json({ result: true, token: data.token, username: data.username });
      } else {
        res.json({ result: false, error: 'Wrong password' });
      }
    }
  });
});


//

module.exports = router;
