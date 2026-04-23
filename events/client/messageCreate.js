const { Events } = require('discord.js');
const OpenAI = require('openai');

// 🌍 GLOBAL PROMPT
const GLOBAL_PROMPT = "You are a helpful AI assistant.";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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

      // ❌ bot OFF if no active channel
      if (!activeChannel) return;

      // ❌ ignore other channels
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

// ================= OPENAI FUNCTION =================
async function askAI(prompt, userMessage) {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
