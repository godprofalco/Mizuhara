const { Events } = require('discord.js');
const OpenAI = require('openai');

// 🌍 GLOBAL PROMPT
const GLOBAL_PROMPT = "You are a helpful assistant.";

// 🤖 GEMINI CLIENT
const ai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
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
    if (!content) return;

    if (content.length > 2000) {
      content = content.slice(0, 1990) + "...";
    }

    return message.reply(content).catch(() => {});
  } catch (err) {
    console.error("Reply Error:", err);
  }
}

// ================= GEMINI =================
async function askAI(prompt, userMessage) {
  try {
    const res = await ai.chat.completions.create({
      model: "gemini-1.5-flash",
      messages: [
        {
          role: "system",
          content: `${prompt}\n\nRules:\n- short replies\n- helpful`
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    return res.choices?.[0]?.message?.content || "❌ No response.";

  } catch (err) {
    console.error("🔥 GEMINI ERROR:", err?.message || err);
    return "❌ AI error occurred.";
  }
}
