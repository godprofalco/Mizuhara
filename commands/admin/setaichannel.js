const AiSettings = require("../../models/AiSettings");

module.exports = {
  name: "setaichannel",
  description: "Set AI chat channel",

  async execute(interaction) {
    let data = await AiSettings.findOne({ guildId: interaction.guild.id });

    if (!data) {
      data = new AiSettings({
        guildId: interaction.guild.id,
        channelId: interaction.channel.id
      });
    } else {
      data.channelId = interaction.channel.id;
    }

    await data.save();

    interaction.reply("This is my channel now 😁");
  }
};