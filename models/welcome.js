const mongoose = require('mongoose');

const welcomeSchema = new mongoose.Schema({
  serverId: String,

  enabled: { type: Boolean, default: false },
  channelId: String,

  type: { type: String, default: 'embed' },

  title: { type: String, default: 'Welcome {mention} 👋' },
  description: { type: String, default: 'Welcome to {server}!' },
  footer: { type: String, default: 'Member #{membercount}' },
  color: { type: String, default: '#00BFFF' },
});

module.exports = mongoose.model('Welcome', welcomeSchema);
