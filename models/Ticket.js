const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  userId: String,
  status: { type: String, default: 'open' },
  reason: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ticket', ticketSchema);
