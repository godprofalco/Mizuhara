const mongoose = require('mongoose');

module.exports = mongoose.model('TicketBan', new mongoose.Schema({
  guildId: String,
  userId: String,
  reason: String,
  moderatorId: String,
}));
