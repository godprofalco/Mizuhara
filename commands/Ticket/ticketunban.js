const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const TicketBan = require('../../models/TicketBan');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketunban')
    .setDescription('Unban user from tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(o => o.setName('user').setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');

    await TicketBan.findOneAndDelete({
      guildId: interaction.guild.id,
      userId: user.id,
    });

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔓 Unbanned')
          .setDescription(`${user} can now create tickets`)
          .setColor('Green'),
      ],
    });
  },
};
