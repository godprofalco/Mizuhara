const mongoose = require('mongoose');

const welcomeSchema = new mongoose.Schema({
  serverId: { type: String, required: true },

  enabled: { type: Boolean, default: false },
  channelId: { type: String },

  type: { type: String, default: 'embed' },

  title: { type: String, default: 'Welcome {mention}!' },
  description: { type: String, default: 'Welcome to {server}' },
  footer: { type: String, default: 'Member #{membercount}' },
  color: { type: String, default: '#00BFFF' },
});

module.exports = mongoose.model('Welcome', welcomeSchema);
