const { Events } = require('discord.js');
const OpenAI = require('openai');

// 🌍 GLOBAL PROMPT
const GLOBAL_PROMPT = "You are a helpful AI assistant.";

// 🤖 GEMINI (OpenAI-compatible endpoint)
const ai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

module.exports = {
  name: Events.MessageCreate,
  once: false,

  async execute(message) {
    if (message.author.bot) return;

    const client = message.client;

    // ================= INIT MAPS =================
    if (!client.guildPrompts) client.guildPrompts = new Map();
    if (!client.activeChannels) client.activeChannels = new Map();

    try {

      // ================= DM MODE =================
      if (!message.guild) {
        const reply = await askAI(GLOBAL_PROMPT, message.content);
        return message.reply(reply);
      }

      // ================= SERVER MODE =================
      const guildId = message.guild.id;

      const activeChannel = client.activeChannels.get(guildId);

      if (!activeChannel) return;

      if (message.channel.id !== activeChannel) return;

      const prompt =
        client.guildPrompts.get(guildId) || GLOBAL_PROMPT;

      const reply = await askAI(prompt, message.content);

      return message.reply(reply);

    } catch (err) {
      console.error("AI Error:", err);
    }
  }
};

// ================= GEMINI AI FUNCTION =================
async function askAI(prompt, userMessage) {
  try {
    const res = await ai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content: `${prompt}

Rules:
- Keep responses short
- Be helpful
- Stay in character`
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    return res.choices[0].message.content;

  } catch (err) {
    console.error(err);
    return "❌ AI error occurred.";
  }
}
