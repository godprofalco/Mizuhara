const { Events } = require('discord.js');
const AiSettings = require('../models/AiSettings');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = {
  name: Events.MessageCreate,
  once: false,

  async execute(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const client = message.client;

    // 🔥 Mention check
    const isMentioned = message.mentions.has(client.user);

    // 🔥 Reply-to-bot check (safe + optimized)
    let isReplyToBot = false;

    if (message.reference?.messageId) {
      try {
        const repliedMsg = await message.channel.messages.fetch(message.reference.messageId);
        isReplyToBot = repliedMsg.author.id === client.user.id;
      } catch {
        isReplyToBot = false;
      }
    }

    // ❌ ignore if not triggered
    if (!isMentioned && !isReplyToBot) return;

    const data = await AiSettings.findOne({
      guildId: message.guild.id
    });

    if (!data) {
      return message.reply("👋 AI not setup yet. Ask owner to configure me.");
    }

    // ✅ clean user message (safe version)
    const userMessage = message.content
      .replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '')
      .trim();

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
You are an AI Discord bot.

Personality:
${data.behavior}

User: ${message.author.username}
Message: ${userMessage || "They replied to you."}

Reply naturally in a short Discord-friendly way.
AI:
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return message.reply({
        content: text.length > 2000 ? text.slice(0, 1990) + "..." : text
      });

    } catch (err) {
      console.error(err);
      return message.reply("⚠️ AI error occurred.");
    }
  },
};