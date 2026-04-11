const mongoose = require('mongoose');

const TicketPanelSchema = new mongoose.Schema({
  guildId: String,
  title: String,
  description: String,
  footer: String,
  dropdowns: [
    {
      name: String,
      emoji: String,
      reasonRequired: Boolean,
    },
  ],
});

module.exports = mongoose.model('TicketPanel', TicketPanelSchema);
