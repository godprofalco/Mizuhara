require('dotenv').config();
const mongoose = require('mongoose');

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(global.styles.infoColor('✅ Connected to MongoDB'));

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);

    // 💥 IMPORTANT: STOP BOT IF DB IS REQUIRED
    process.exit(1);
  }
};
