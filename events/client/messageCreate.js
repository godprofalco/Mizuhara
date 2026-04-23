const { Events } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 🌍 GLOBAL PROMPT
const GLOBAL_PROMPT = "You are a helpful assistant.";

// 🤖 GEMINI CLIENT (FIXED MODEL)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest"
});

// ================= COOLDOWN =================
const cooldown = new Map();

function isRateLimited(userId) {
  const now = Date.now();
  const last = cooldown.get(userId);

  if (last && now - last < 4000) return true;

  cooldown.set(userId, now);
  return false;
}

module.exports = {
  name: Events.MessageCreate,

  async execute(message) {
    if (message.author.bot) return;

    const client = message.client;

    if (!client.guildPrompts) client.guildPrompts = new Map();
    if (!client.activeChannels) client.activeChannels = new Map();

    try {
      if (isRateLimited(message.author.id)) return;

      // ================= DM MODE =================
      if (!message.guild) {
        const reply = await askAI(GLOBAL_PROMPT, message.content);
        return safeReply(message, reply);
      }

      const guildId = message.guild.id;

      const activeChannel = client.activeChannels.get(guildId);
      if (!activeChannel) return;

      if (message.channel.id !== activeChannel) return;

      const prompt = client.guildPrompts.get(guildId) || GLOBAL_PROMPT;

      const reply = await askAI(prompt, message.content);

      return safeReply(message, reply);

    } catch (err) {
      console.error("AI Error:", err);
    }
  }
};

// ================= SAFE REPLY =================
async function safeReply(message, content) {
  try {
    if (!content || typeof content !== "string") return;

    const finalContent =
      content.length > 2000
        ? content.slice(0, 1990) + "..."
        : content;

    return message.reply(finalContent).catch(() => {});
  } catch (err) {
    console.error("Reply Error:", err);
  }
}

// ================= GEMINI =================
async function askAI(prompt, userMessage) {
  try {
    const result = await model.generateContent(
      `${prompt}\n\nUser: ${userMessage}`
    );

    const response = await result.response;

    if (!response || !response.text) return "❌ No response.";

    return response.text();

  } catch (err) {
    console.error("🔥 GEMINI ERROR:", err);
    return "❌ AI error occurred.";
  }
}
