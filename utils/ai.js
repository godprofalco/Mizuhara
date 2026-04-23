const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const BASE_RULES = `
You are a Discord AI assistant.

Rules:
- Follow Discord community guidelines
- Never generate NSFW or explicit sexual content
- Stay helpful and respectful
- Keep replies under 5 sentences
`;

async function generateAIResponse(message, data) {
  const userPrompt =
    data?.prompt ||
    "You are a helpful, friendly AI assistant.";

  const finalPrompt = `${BASE_RULES}\n\n${userPrompt}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: finalPrompt
        },
        {
          role: "user",
          content: message.content
        }
      ]
    });

    const reply = response.choices[0].message.content;

    return message.reply(reply);
  } catch (err) {
    console.error("OpenAI Error:", err);
    return message.reply("❌ AI error occurred.");
  }
}

module.exports = { generateAIResponse };
