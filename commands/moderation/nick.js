const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription("Change your or another user's nickname.")
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to change nickname for')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('nickname')
        .setDescription('The new nickname')
        .setRequired(true)
    ),

  async execute(interaction) {
    const OWNER_ID = "969181284784025670";

    const isOwner = interaction.user.id === OWNER_ID;
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

    if (!isOwner && !isAdmin) {
      return interaction.reply({
        content: "Only server admins or the bot owner can use this command.",
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser('user');
    const nickname = interaction.options.getString('nickname');

    const member = interaction.guild.members.cache.get(user.id);
    const botMember = interaction.guild.members.me;

    if (!member) {
      return interaction.reply({
        content: 'User not found in this server.',
        ephemeral: true,
      });
    }

    if (member.id === interaction.guild.ownerId) {
      return interaction.reply({
        content: 'You cannot change the server owner nickname.',
        ephemeral: true,
      });
    }

    if (member.roles.highest.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content: 'I cannot change this nickname due to role hierarchy.',
        ephemeral: true,
      });
    }

    try {
      await member.setNickname(nickname);

      return interaction.reply({
        content: `✅ Nickname for **${user.username}** changed to **${nickname}**.`,
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "I couldn't change this user's nickname. Check my permissions.",
        ephemeral: true,
      });
    }
  },
};