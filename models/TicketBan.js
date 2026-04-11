const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  guildId: String,
  userId: String,
  reason: String,
  moderatorId: String,
});

module.exports = mongoose.model('TicketBan', schema);
