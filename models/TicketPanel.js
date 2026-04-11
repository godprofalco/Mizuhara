const mongoose = require('mongoose');

const dropdownSchema = new mongoose.Schema({
  name: String,
  emoji: String,
  description: String,
});

const ticketPanelSchema = new mongoose.Schema({
  guildId: String,
  title: String,
  description: String,
  footer: String,
  dropdowns: [dropdownSchema],
});

module.exports = mongoose.model('TicketPanel', ticketPanelSchema);
