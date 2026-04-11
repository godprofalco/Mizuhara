const mongoose = require('mongoose');

const TicketBanSchema = new mongoose.Schema({
  guildId: String,
  userId: String,
  reason: String,
  moderatorId: String,
});

module.exports = mongoose.model('TicketBan', TicketBanSchema);
