const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstName: String,
  lastName:String,
  activeSince : { type: Date, default: Date.now },
  fieldOfWork : String,
  email : String,
  password: String,
  token: String,
  style : {
    fontStyle : {type : String, default : "Garamond"},
    fontSize : {type : Number, default : 2}
  },
  defaultActiveAssistants : [{
    assistant: String,
    degreeOfIntervention: Number
  }]
});

const User = mongoose.model('users', userSchema);

module.exports = User;