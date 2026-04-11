const mongoose = require('mongoose');

const TicketCategorySchema = new mongoose.Schema({
  guildId: String,
  name: String,
  description: String,
  emoji: String,
});

module.exports = mongoose.model('TicketCategory', TicketCategorySchema);
