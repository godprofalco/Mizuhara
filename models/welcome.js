const mongoose = require('mongoose');

const welcomeSchema = new mongoose.Schema({
  serverId: { type: String, required: true, unique: true },

  channelId: String,

  title: { type: String, default: '🌸 Welcome!' },
  description: { type: String, default: 'Welcome {mention} to {server} 🌟' },
  footer: { type: String, default: 'Enjoy your stay ❄️' },

  thumbnail: { type: Boolean, default: true },

  imageMode: {
    type: String,
    default: 'user', // user | server | banner | url
  },

  imageURL: { type: String, default: null },
});

module.exports = mongoose.model('Welcome', welcomeSchema);
