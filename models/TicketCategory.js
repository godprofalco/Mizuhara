const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  guildId: String,
  name: String,
  description: String,
  emoji: String,
});

module.exports = mongoose.model('TicketCategory', schema);
