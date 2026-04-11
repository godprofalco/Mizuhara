const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  userId: String,
  reason: String,
  category: String,
  status: { type: String, default: 'open' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ticket', TicketSchema);
