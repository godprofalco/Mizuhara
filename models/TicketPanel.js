const mongoose = require('mongoose');

module.exports = mongoose.model('TicketPanel', new mongoose.Schema({
  guildId: String,
  title: String,
  description: String,
  footer: String,
  dropdowns: [
    {
      name: String,
      emoji: String,
      description: String,
      categoryId: String,
    },
  ],
}));
