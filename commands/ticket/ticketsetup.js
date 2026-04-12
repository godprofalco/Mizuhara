const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');

const TicketPanel = require('../../models/TicketPanel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketsetup')
    .setDescription('Setup ticket system')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ No permission', ephemeral: true });
    }

    await TicketPanel.findOneAndUpdate(
      { guildId: interaction.guildId },
      {
        guildId: interaction.guildId,
        title: '🎫 Tickets',
        description: 'Select a category to open a ticket',
        footer: 'Ticket System',

        dropdowns: [
          {
            name: 'Support',
            emoji: '🛠️',
            description: 'Get help',
            channelCategoryId: null,
          },
          {
            name: 'Prices',
            emoji: '💰',
            description: 'Pricing help',
            channelCategoryId: null,
          },
        ],
      },
      { upsert: true }
    );

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('✅ Ticket System Setup Complete')
          .setColor('Green')
      ],
      ephemeral: true,
    });
  },
};
