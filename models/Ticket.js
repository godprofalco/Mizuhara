const mongoose = require('mongoose');

module.exports = mongoose.model('Ticket', new mongoose.Schema({
  guildId: String,
  channelId: String,
  userId: String,
  claimedBy: String,
  category: String,
  reason: String,
  status: { type: String, default: 'open' },
  createdAt: { type: Date, default: Date.now },
  closedAt: Date,
}));
