const mongoose = require('mongoose');

module.exports = mongoose.model('TicketSettings', new mongoose.Schema({
  guildId: String,
  enabled: { type: Boolean, default: true },
  categoryId: String,
  logChannelId: String,
  supportRoleIds: [String],
  ticketLimit: { type: Number, default: 3 },
}));
