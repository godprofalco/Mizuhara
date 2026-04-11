const mongoose = require('mongoose');

const ticketSettingsSchema = new mongoose.Schema({
  guildId: { type: String, unique: true },

  enabled: { type: Boolean, default: false },

  categoryId: String, // ticket parent category
  logChannelId: String,

  supportRoleIds: [String],

  ticketLimit: { type: Number, default: 3 },
});

module.exports = mongoose.model('TicketSettings', ticketSettingsSchema);
