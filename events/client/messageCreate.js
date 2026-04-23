const { Events } = require('discord.js');
const OpenAI = require('openai');

// 🌍 GLOBAL PROMPT (fallback brain)
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

    // ================= INIT STORAGE SAFETY =================
    if (!client.guildPrompts) client.guildPrompts = new Map();
    if (!client.activeChannels) client.activeChannels = new Map();

    try {

      // ================= DM MODE =================
      if (!message.guild) {
        const reply = await generateAIResponse(
          GLOBAL_PROMPT,
          message.content
        );

        return message.reply(reply);
      }

      // ================= SERVER MODE =================
      const guildId = message.guild.id;
      const activeChannel = client.activeChannels.get(guildId);

      // ❌ Bot disabled if no active channel
      if (!activeChannel) return;

      // ❌ Ignore other channels
      if (message.channel.id !== activeChannel) return;

      // ================= PROMPT SYSTEM =================
      const serverPrompt =
        client.guildPrompts.get(guildId) || GLOBAL_PROMPT;

      // ================= AI RESPONSE =================
      const reply = await generateAIResponse(
        serverPrompt,
        message.content
      );

      return message.reply(reply);

    } catch (error) {
      console.error("AI Message Error:", error);
    }
  },
};

// ================= OPENAI FUNCTION =================
async function generateAIResponse(prompt, message) {

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
${prompt}

Rules:
- Keep replies short (max 5 sentences)
- Be helpful and natural
- Stay in character
          `
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    return response.choices[0].message.content;

  } catch (err) {
    console.error("OpenAI Error:", err);
    return "❌ AI is currently unavailable.";
  }
}
