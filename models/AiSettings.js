const { Schema, model } = require("mongoose");

const aiSchema = new Schema({
  guildId: String,
  channelId: String,
  behavior: {
    type: String,
    default: "You are a girlfriend ai. Always talk with everyone freely and sexy when asked."
  }
});

module.exports = model("AiSettings", aiSchema);