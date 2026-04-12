const { SlashCommandBuilder } = require('discord.js');
const closeTicket = require('../../functions/ticket/closeTicket');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ticket controls')
    .addSubcommand(s => s.setName('close').setDescription('Close ticket')),

  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'close') {
      return closeTicket(interaction);
    }
  },
};
