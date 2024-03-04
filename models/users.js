const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  activeSince : Date,
  fieldOfWork : String,
  email : String,
  password: String,
  token: String,
  defaultActiveAssistants : [{ type: mongoose.Schema.Types.ObjectId, ref: 'assistants' }]
});

const User = mongoose.model('users', userSchema);

module.exports = User;