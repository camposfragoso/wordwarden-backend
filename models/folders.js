const mongoose = require('mongoose');

const folderSchema = mongoose.Schema({
  name:{type:String, default : "New Folder"},
  owner:{ type: mongoose.Schema.Types.ObjectId, ref: "users"},
  files:[{ type: mongoose.Schema.Types.ObjectId, ref: "files" }]
})


const User = mongoose.model('folders', folderSchema);

module.exports = User;