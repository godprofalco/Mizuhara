const mongoose = require('mongoose');

const ticketBanSchema = new mongoose.Schema({
  guildId: String,
  userId: String,
  reason: String,
  moderatorId: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TicketBan', ticketBanSchema);
