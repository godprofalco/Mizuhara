const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: String,
  emoji: String,
  description: String,
});

const ticketPanelSchema = new mongoose.Schema({
  guildId: String,

  title: String,
  description: String,
  footer: String,

  categories: [categorySchema], // ✅ dynamic categories

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TicketPanel', ticketPanelSchema);
