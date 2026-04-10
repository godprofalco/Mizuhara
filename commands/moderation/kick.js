const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to kick')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for kicking the user')
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
        content: 'The user is not in the server.',
        ephemeral: true,
      });
    }

    const botMember = interaction.guild.members.cache.get(
      interaction.client.user.id
    );

    if (!member.kickable) {
      return interaction.reply({
        content:
          'I cannot kick this user (role hierarchy or missing permissions).',
        ephemeral: true,
      });
    }

    if (member.roles.highest.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content:
          'I cannot kick this user as they have a higher or equal role than me.',
        ephemeral: true,
      });
    }

    await member.kick(reason);

    const kickEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('Member Kicked')
      .setDescription(`👢 ${user.tag} has been kicked from the server.`)
      .addFields(
        { name: 'Reason', value: reason, inline: true },
        {
          name: 'Kicked by',
          value: `<@${interaction.user.id}>`,
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [kickEmbed] });
  },
};