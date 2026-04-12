const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const TicketPanel = require('../../models/TicketPanel');
const TicketSettings = require('../../models/TicketSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketsetup')
    .setDescription('Setup ticket system')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {

    await TicketPanel.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        guildId: interaction.guild.id,
        title: '🎫 Tickets',
        description: 'Select option',
        footer: 'Ticket System',
        dropdowns: [],
      },
      { upsert: true }
    );

    await TicketSettings.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        guildId: interaction.guild.id,
        supportRoleIds: [],
        adminRoleIds: [],
      },
      { upsert: true }
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('setup_add_dropdown')
        .setLabel('Add Dropdown')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('setup_roles')
        .setLabel('Set Roles')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      content: '⚙️ Setup Panel Opened',
      components: [row],
      ephemeral: true,
    });
  },
};
