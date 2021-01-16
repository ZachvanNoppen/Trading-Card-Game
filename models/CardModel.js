const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let cardSchema = Schema({
  //Names will be strings between 1-30 characters
  //Must consist of only A-Z characters
  //Will be trimmed automatically (i.e., outer spacing removed)
  artist: {
    type: String,
  },
  attack: {
    type: Number,
  },
  name: {
    type: String,
  },
  race: {
    type: String,
  },
  rarity: {
    type: String,
  },
  health: {
    type: Number,
  },
  cardClass: {
    type: String,
  },
});

//Instance method finds purchases of this user

module.exports = mongoose.model("Card", cardSchema);
