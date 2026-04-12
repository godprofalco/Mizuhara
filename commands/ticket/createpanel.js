const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionFlagsBits,
} = require('discord.js');

const TicketPanel = require('../models/TicketPanel.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createpanel')
    .setDescription('Send ticket panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(o =>
      o
        .setName('channel')
        .setDescription('Channel to send the ticket panel')
        .setRequired(true)
    ),

  async execute(interaction) {

    const channel = interaction.options.getChannel('channel');

    const panel = await TicketPanel.findOne({
      guildId: interaction.guild.id,
    });

    if (!panel || !panel.dropdowns || panel.dropdowns.length === 0) {
      return interaction.reply({
        content: '❌ No ticket dropdowns configured. Use setup first.',
        ephemeral: true,
      });
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticket_menu')
      .setPlaceholder('🎫 Select a ticket type')
      .addOptions(
        panel.dropdowns.map(d => ({
          label: d.name,
          value: d.name,
          emoji: d.emoji || '🎫',
        }))
      );

    const embed = new EmbedBuilder()
      .setTitle(panel.title || 'Ticket Panel')
      .setDescription(panel.description || 'Select an option below')
      .setColor('Gold');

    await channel.send({
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(menu)
      ],
    });

    return interaction.reply({
      content: '✅ Panel sent successfully',
      ephemeral: true,
    });
  },
};
