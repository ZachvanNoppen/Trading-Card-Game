const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let userSchema = Schema({
  //Names will be strings between 1-30 characters
  //Must consist of only A-Z characters
  //Will be trimmed automatically (i.e., outer spacing removed)
  username: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 30,
    match: /[A-Za-z]+/,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 20,
    match: /[A-Za-z]+/,
    trim: true,
  },
  cards: {
    type: Array,
    required: false,
  },
  friends: {
    type: Array,
    required: false,
  },
});

//Instance method finds purchases of this user

module.exports = mongoose.model("User", userSchema);
