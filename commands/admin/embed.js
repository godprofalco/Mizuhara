const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('🎨 Open embed builder')

    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Where to send embed')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {

    const DEV_ID = 'YOUR_DISCORD_ID';

    if (interaction.user.id !== DEV_ID) {
      return interaction.reply({
        content: '❌ Developer only.',
        ephemeral: true
      });
    }

    const channel = interaction.options.getChannel('channel');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`embed_modal_${channel.id}`)
        .setLabel('🛠️ Configure Embed')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      content: `🎨 Configure embed for <#${channel.id}>`,
      components: [row],
      ephemeral: true
    });
  }
};
