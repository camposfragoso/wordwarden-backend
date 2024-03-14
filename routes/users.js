var express = require('express');
const { checkBody } = require("../modules/checkbody");
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const User = require("../models/users")
const Folder = require("../models/folders")
const Files = require("../models/files")
require("../models/connection")

var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

//POST : signup
router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['email', 'password', "lastName", "firstName"])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ email: req.body.email }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        fieldOfWork: req.body.fieldOfWork,
        email: req.body.email,
        password: hash,
        token: uid2(32)

      });

      newUser.save().then(() => {

        res.json({ result: true, user: newUser});
      })


    } else {
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

  User.findOne({ email: req.body.email }).then(userData => {
    if (userData === null) {
      res.json({ result: false, error: "user not found" })
    } else {
      console.log(userData)
      if (bcrypt.compareSync(req.body.password, userData.password)) {
        
          res.json({ result: true, token: userData.token, firstName: userData.firstName });
     
      } else {
        res.json({ result: false, error: 'Wrong password' });
      }
    }
  });
});
//given a user, delete all folders

router.delete("/:token", (req, res) => {
  User.findOne({ token: req.params.token }).then(userData => {
    if (userData !== null) {
      Folder.deleteMany({ owner: userData._id }).then(() => {
        Files.deleteMany({ author: userData._id }).then(() => {
          res.json({ result: true, message: "everything deleted" })
        })
      })
    }
  })
})
//

module.exports = router;
