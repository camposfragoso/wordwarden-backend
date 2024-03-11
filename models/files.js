const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
  //content type to change according to what tiptap returns
  content: {type : String, default:""},
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  creationDate: { type: Date, default: Date.now },
  lastModified: {type : Date, default : Date.now},
  title: {type : String, default : "New file"},
  pendingSuggestions: Array,
  activeAssistants:{type : [String], default :["ela","dev","sum"]}
})

const File = mongoose.model('files', fileSchema);

module.exports = File;