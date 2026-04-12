const mongoose = require('mongoose');

const dropdownSchema = new mongoose.Schema({
  name: String,
  emoji: String,
  description: String,
  categoryId: String,
});

module.exports = mongoose.model(
  'TicketPanel',
  new mongoose.Schema({
    guildId: String,
    title: String,
    description: String,
    footer: String,
    dropdowns: [dropdownSchema],
  })
);
