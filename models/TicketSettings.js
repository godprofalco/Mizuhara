const mongoose = require('mongoose');

const TicketSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true },
  categoryId: String,
  logChannelId: String,
  supportRoleIds: [String],
  ticketLimit: { type: Number, default: 3 },
});

module.exports = mongoose.model('TicketSettings', TicketSettingsSchema);
