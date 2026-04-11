const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const TicketPanel = require('../../models/TicketPanel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketdropdown')
    .setDescription('Add dropdown option')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o => o.setName('label').setRequired(true))
    .addStringOption(o => o.setName('value').setRequired(true))
    .addStringOption(o => o.setName('emoji').setRequired(false)),

  async execute(interaction) {
    const panel = await TicketPanel.findOne({ guildId: interaction.guild.id });

    panel.dropdowns.push({
      label: interaction.options.getString('label'),
      value: interaction.options.getString('value'),
      emoji: interaction.options.getString('emoji') || '🎫',
    });

    await panel.save();

    interaction.reply({ content: '✅ Dropdown added!', ephemeral: true });
  },
};
