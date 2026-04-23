const store = require("../config/aiStore");

// 🔥 Replace this later with OpenAI / Gemini API
async function generateAI(prompt, message) {
  return `🤖 [AI MODE]\n\nPrompt: ${prompt}\nUser: ${message}`;
}

async function getAIResponse({ guildId, message, isDM }) {

  const globalPrompt = store.globalPrompt;

  if (isDM) {
    return generateAI(globalPrompt, message);
  }

  const activeChannel = store.activeChannels.get(guildId);
  if (!activeChannel) return null;

  const serverPrompt =
    store.guildPrompts.get(guildId) || globalPrompt;

  return generateAI(serverPrompt, message);
}

module.exports = { getAIResponse };
