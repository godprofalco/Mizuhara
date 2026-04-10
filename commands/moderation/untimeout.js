const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Remove the timeout from a member.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to remove timeout from')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for removing the timeout')
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

    const user = interaction.options.getUser('user');
    const reason =
      interaction.options.getString('reason') || 'No reason provided.';

    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({
        content: 'That user is not in this server.',
        ephemeral: true,
      });
    }

    const botMember = interaction.guild.members.me;

    if (member.roles.highest.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content:
          'I cannot remove timeout from this user due to role hierarchy.',
        ephemeral: true,
      });
    }

    if (!member.communicationDisabledUntilTimestamp) {
      return interaction.reply({
        content: 'This user is not currently timed out.',
        ephemeral: true,
      });
    }

    await member.timeout(null, reason);

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Member Timeout Removed')
      .setDescription(`✅ **${user.tag}** has been removed from timeout.`)
      .addFields(
        { name: 'Reason', value: reason, inline: true },
        {
          name: 'Removed By',
          value: `<@${interaction.user.id}>`,
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};