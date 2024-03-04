const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
  //content type to change according to what tiptap returns
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  creationDate: { type: Date, default: Date.now },
  lastModified: {type : Date, default : Date.now},
  title: String,
  locatedIn: String,
  pendingSuggestions: Array,
  activeAssistants: [{
    assistant: { type: mongoose.Schema.Types.ObjectId, ref: 'assistants' },
    degreeOfIntervention: Number
  }]
})

const File = mongoose.model('files', fileSchema);

module.exports = File;