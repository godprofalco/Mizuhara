const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

const OWNER_ID = "969181284784025670";

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('📤 Embed Builder'),

  async execute(interaction) {

    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: '❌ Only owner can use this.',
        ephemeral: true
      });
    }

    const modal = new ModalBuilder()
      .setCustomId('embed_builder')
      .setTitle('Embed Builder');

    const channel = new TextInputBuilder()
      .setCustomId('channel')
      .setLabel('Channel ID')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const title = new TextInputBuilder()
      .setCustomId('title')
      .setLabel('Title')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const description = new TextInputBuilder()
      .setCustomId('description')
      .setLabel('Description')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    const footer = new TextInputBuilder()
      .setCustomId('footer')
      .setLabel('Footer')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const topImage = new TextInputBuilder()
      .setCustomId('top_image')
      .setLabel('Top Image URL (before embed)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(channel),
      new ActionRowBuilder().addComponents(title),
      new ActionRowBuilder().addComponents(description),
      new ActionRowBuilder().addComponents(footer),
      new ActionRowBuilder().addComponents(topImage),
    );

    return interaction.showModal(modal);
  }
};
