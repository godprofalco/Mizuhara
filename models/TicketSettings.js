const mongoose = require('mongoose');

module.exports = mongoose.model('TicketSettings', new mongoose.Schema({
  guildId: String,
  supportRoleIds: [String],
  adminRoleIds: [String],
  logChannelId: String,
  ticketCounter: { type: Number, default: 0 },
}));
