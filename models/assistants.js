const mongoose = require("mongoose");

const assistantSchema = mongoose.Schema({
  name : String,
  wrapper : String
})

const assistant = mongoose.model("assistants",assistantSchema)

module.exports = assistant