const mongoose = require('mongoose');

const documentSchema = mongoose.Schema({
  //content type to change according to what tiptap returns
  content: String,
  author:{type : mongoose.Schema.Types.ObjectId, ref:"users"},
  creationDate: { type: Date, default: Date.now },
  lastModified : Date,
  title:String,
  locatedIn:String,
  pendingSuggestions:Array,
  activeAssistants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'assistants' }]
})

const Document = mongoose.model('documents', documentSchema);

module.exports = Document;