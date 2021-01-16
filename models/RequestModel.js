const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let requestSchema = Schema({
  sender: {
    //NOT OBJECT ID. TALK ABOUT THIS IN THE DOC
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  offer: {
    type: Array,
    required: false,
  },
  return: {
    type: Array,
    required: false,
  },
});

//Instance method finds purchases of this user

module.exports = mongoose.model("Request", requestSchema);
