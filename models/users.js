const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
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
    assistant: { type: mongoose.Schema.Types.ObjectId, ref: 'assistants' },
    degreeOfIntervention: Number
  }]
});

const User = mongoose.model('users', userSchema);

module.exports = User;