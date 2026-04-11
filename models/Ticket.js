const mongoose = require('mongoose');

module.exports = mongoose.model('Ticket', new mongoose.Schema({
  guildId: String,
  channelId: String,
  userId: String,
  ticketId: String,
  status: { type: String, default: 'open' },
  claimedBy: String,
  claimedAt: Date,
}));
