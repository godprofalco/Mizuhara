const axios = require("axios");
const store = require("../config/aiStore");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 🧠 REAL AI CALL (OpenAI GPT)
async function generateAI(prompt, message) {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.choices[0].message.content;
  } catch (err) {
    console.error("AI ERROR:", err.message);
    return "⚠️ AI error occurred.";
  }
}

// 🧠 CORE LOGIC
async function getAIResponse({ guildId, message, isDM }) {

  const globalPrompt = store.globalPrompt;

  // 💬 DM MODE
  if (isDM) {
    return generateAI(globalPrompt, message);
  }

  // ❌ NO ACTIVE CHANNEL = DO NOTHING
  const activeChannel = store.activeChannels.get(guildId);
  if (!activeChannel) return null;

  // 🟢 SERVER MODE
  const serverPrompt =
    store.guildPrompts.get(guildId) || globalPrompt;

  return generateAI(serverPrompt, message);
}

module.exports = { getAIResponse };
