const AiSettings = require("../../models/AiSettings");

const OWNER_ID = "969181284784025670";

module.exports = {
  name: "setbehavior",
  description: "Set AI behavior",
  options: [
    {
      name: "text",
      type: 3,
      description: "AI personality",
      required: true
    }
  ],

  async execute(interaction) {

    // ❌ Block DMs (only server)
    if (!interaction.guild) {
      return interaction.reply({
        content: "❌ Use this in a server.",
        ephemeral: true
      });
    }

    // 🔒 Only YOU (owner)
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: "❌ Only my owner can change this.",
        ephemeral: true
      });
    }

    const text = interaction.options.getString("text");

    let data = await AiSettings.findOne({ guildId: interaction.guild.id });

    if (!data) {
      data = new AiSettings({
        guildId: interaction.guild.id,
        behavior: text
      });
    } else {
      data.behavior = text;
    }

    await data.save();

    interaction.reply("🧠 Behavior updated for this server.");
  }
};