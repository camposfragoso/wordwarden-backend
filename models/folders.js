const mongoose = require('mongoose');

const folderSchema = mongoose.Schema({
  name:{type:String, default : "New Folder"},
  owner:{ type: mongoose.Schema.Types.ObjectId, ref: "users"},
  parentFolder : { type: mongoose.Schema.Types.ObjectId, ref: "folders" },
  childrenFolders:[{ type: mongoose.Schema.Types.ObjectId, ref: "folders" }],
  files:[{ type: mongoose.Schema.Types.ObjectId, ref: "files" }],
  isMain:{type:Boolean, default:false}
})


const User = mongoose.model('folders', folderSchema);

module.exports = User;