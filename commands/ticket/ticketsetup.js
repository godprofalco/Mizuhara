const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js');

const TicketPanel = require('../../models/TicketPanel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketsetup')
    .setDescription('Setup ticket panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const panel = await TicketPanel.findOneAndUpdate(
      { guildId: interaction.guildId },
      {
        guildId: interaction.guildId,
        title: '🎫 Ticket System',
        description: 'Select an option below',
        footer: 'Support System',
        dropdowns: [
          { name: 'Support', emoji: '🛠️', description: 'General help' },
          { name: 'Shop', emoji: '💰', description: 'Buying issues' },
        ],
      },
      { upsert: true, new: true }
    );

    return interaction.reply({
      content: '✅ Ticket setup complete',
      ephemeral: true,
    });
  },
};
