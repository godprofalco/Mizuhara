const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const TicketBan = require('../../models/TicketBan');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketban')
    .setDescription('Ban user from tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(o => o.setName('user').setRequired(true))
    .addStringOption(o => o.setName('reason')),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason';

    await TicketBan.create({
      guildId: interaction.guild.id,
      userId: user.id,
      reason,
      moderatorId: interaction.user.id,
    });

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔨 Ticket Banned')
          .setDescription(`${user} banned from tickets`)
          .setColor('Red'),
      ],
    });
  },
};
