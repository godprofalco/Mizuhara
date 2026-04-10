const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a member from the server.')
    .addStringOption((option) =>
      option
        .setName('user_id')
        .setDescription('The ID of the user to unban')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for unbanning the user')
        .setRequired(false)
    ),

  async execute(interaction) {
    const OWNER_ID = "969181284784025670";

    const isOwner = interaction.user.id === OWNER_ID;
    const isAdmin = interaction.member.permissions.has('Administrator');

    if (!isOwner && !isAdmin) {
      return interaction.reply({
        content: "Only server admins or the bot owner can use this command.",
        ephemeral: true,
      });
    }

    const userId = interaction.options.getString('user_id');
    const reason =
      interaction.options.getString('reason') || 'No reason provided.';

    try {
      await interaction.guild.members.unban(userId, reason);

      const unbanEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('Member Unbanned')
        .setDescription(`✅ \`${userId}\` has been unbanned from the server.`)
        .addFields(
          { name: 'Reason', value: reason, inline: true },
          {
            name: 'Unbanned by',
            value: `<@${interaction.user.id}>`,
            inline: true,
          }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [unbanEmbed] });
    } catch (error) {
      console.error(error);

      return interaction.reply({
        content:
          'Failed to unban the user. Make sure the ID is correct and the user is actually banned.',
        ephemeral: true,
      });
    }
  },
};