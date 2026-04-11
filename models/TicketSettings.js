const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  guildId: String,
  enabled: { type: Boolean, default: false },
  categoryId: String,
  logChannelId: String,
  supportRoleIds: [String],
  ticketLimit: Number,
});

module.exports = mongoose.model('TicketSettings', schema);
