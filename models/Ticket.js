const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  userId: String,
  reason: String,
  category: String,
  status: { type: String, default: 'open' },
  ticketId: String,
});

module.exports = mongoose.model('Ticket', ticketSchema);
