const { Events } = require('discord.js');

// 🌍 GLOBAL PROMPT (fallback brain)
const GLOBAL_PROMPT = "You are a helpful AI assistant.";

module.exports = {
  name: Events.MessageCreate,
  once: false,

  async execute(message) {
    if (message.author.bot) return;

    const client = message.client;

    // ================= INIT STORAGE SAFETY =================
    if (!client.guildPrompts) client.guildPrompts = new Map();
    if (!client.activeChannels) client.activeChannels = new Map();

    try {

      // ================= DM MODE =================
      if (!message.guild) {

        const reply = generateAIResponse(
          GLOBAL_PROMPT,
          message.content
        );

        return message.reply(reply);
      }

      // ================= SERVER MODE =================
      const guildId = message.guild.id;
      const activeChannel = client.activeChannels.get(guildId);

      // ❌ If no active channel → bot stays silent
      if (!activeChannel) return;

      // ❌ If not in active channel → ignore everything
      if (message.channel.id !== activeChannel) return;

      // ================= GET PROMPT =================
      const serverPrompt =
        client.guildPrompts.get(guildId) || GLOBAL_PROMPT;

      // ================= AI RESPONSE =================
      const reply = generateAIResponse(
        serverPrompt,
        message.content
      );

      return message.reply(reply);

    } catch (error) {
      console.error("AI Message Error:", error);
    }
  },
};

// ================= FAKE AI FUNCTION (REPLACE WITH API LATER) =================
function generateAIResponse(prompt, message) {
  return `🤖 (${prompt})\n\nYou said: ${message}`;
}
