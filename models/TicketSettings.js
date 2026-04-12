const mongoose = require('mongoose');

const TicketSettingsSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },

  enabled: {
    type: Boolean,
    default: true,
  },

  // 👮 Support roles (can see tickets)
  supportRoleIds: {
    type: [String],
    default: [],
  },

  // 📂 Default fallback category (if dropdown has none)
  categoryId: {
    type: String,
    default: null,
  },

  // 📜 Logs channel (for close logs / transcripts)
  logChannelId: {
    type: String,
    default: null,
  },

  // 🔢 Optional: ticket limit per user
  ticketLimit: {
    type: Number,
    default: 3,
  },

  // 🔢 Ticket counter (for numbering system later)
  ticketCounter: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('TicketSettings', TicketSettingsSchema);
