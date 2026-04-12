const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const TicketPanel = require('../../models/TicketPanel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketsetup')
    .setDescription('Open ticket setup UI')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {

    let panel = await TicketPanel.findOne({ guildId: interaction.guild.id });

    if (!panel) {
      panel = await TicketPanel.create({
        guildId: interaction.guild.id,
        title: '🎫 Tickets',
        description: 'Select category',
        footer: 'Ticket System',
        dropdowns: [],
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('⚙️ Ticket Setup')
      .setDescription(
        `Title: ${panel.title}\n` +
        `Dropdowns: ${panel.dropdowns.length}`
      )
      .setColor('#5865f2');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('setup_edit_embed')
        .setLabel('Edit Embed')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('setup_add_dropdown')
        .setLabel('Add Dropdown')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('setup_remove_dropdown')
        .setLabel('Remove Dropdown')
        .setStyle(ButtonStyle.Danger),
    );

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
};
