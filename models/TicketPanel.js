const mongoose = require('mongoose');

const panelSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,

  title: String,
  description: String,
  footer: String,

  supportRoleId: String,
  categoryId: String,

  dropdowns: [
    {
      label: String,
      value: String,
      emoji: String,
    },
  ],
});

module.exports = mongoose.model('TicketPanel', panelSchema);
