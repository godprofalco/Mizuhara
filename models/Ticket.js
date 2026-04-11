const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  userId: String,

  category: String,
  reason: String,

  status: { type: String, default: 'open' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ticket', ticketSchema);
