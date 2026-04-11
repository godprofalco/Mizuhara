const mongoose = require('mongoose');

module.exports = mongoose.model('TicketCategory', new mongoose.Schema({
  guildId: String,
  name: String,
  description: String,
  emoji: String,
}));
