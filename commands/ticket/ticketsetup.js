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
    await TicketPanel.findOneAndUpdate(
      { guildId: interaction.guildId },
      {
        guildId: interaction.guildId,
        title: '🎫 Tickets',
        description: 'Select a category to open a ticket',
        footer: 'Ticket System',
        dropdowns: [
          { name: 'Support', emoji: '🛠️', reasonRequired: true },
          { name: 'Prices', emoji: '💰', reasonRequired: true },
        ],
      },
      { upsert: true, new: true }
    );

    const embed = new EmbedBuilder()
      .setTitle('✅ Ticket Setup Complete')
      .setDescription('Use /ticketpanel to send panel')
      .setColor('Green');

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
