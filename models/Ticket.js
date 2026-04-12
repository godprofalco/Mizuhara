const mongoose = require('mongoose');

module.exports = mongoose.model(
  'Ticket',
  new mongoose.Schema({
    guildId: String,
    channelId: String,
    userId: String,
    status: { type: String, default: 'open' },
  })
);
