const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const TicketPanel = require('../../models/TicketPanel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketsetup')
    .setDescription('Setup ticket system')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o => o.setName('title').setRequired(true))
    .addStringOption(o => o.setName('description').setRequired(true))
    .addStringOption(o => o.setName('footer').setRequired(true)),

  async execute(interaction) {
    await TicketPanel.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        guildId: interaction.guild.id,
        title: interaction.options.getString('title'),
        description: interaction.options.getString('description'),
        footer: interaction.options.getString('footer'),
        dropdowns: [],
      },
      { upsert: true }
    );

    interaction.reply({ content: '✅ Setup saved!', ephemeral: true });
  },
};
