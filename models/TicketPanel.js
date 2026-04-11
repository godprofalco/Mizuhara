const mongoose = require('mongoose');

const ticketPanelSchema = new mongoose.Schema({
  guildId: String,

  title: String,
  description: String,
  footer: String,

  supportRoleId: String,
  categoryId: String,
  logChannelId: String,

  dropdowns: [
    {
      name: String,
      emoji: String,
      reasonRequired: Boolean,
    },
  ],
});

module.exports = mongoose.model('TicketPanel', ticketPanelSchema);
