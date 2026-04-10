const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Locks the channel to prevent messages from being sent.'),

  async execute(interaction) {
    const OWNER_ID = "969181284784025670";

    const isOwner = interaction.user.id === OWNER_ID;
    const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

    if (!isOwner && !isAdmin) {
      return interaction.reply({
        content: "Only server admins or the bot owner can use this command.",
        ephemeral: true,
      });
    }

    const channel = interaction.channel;
    const everyone = interaction.guild.roles.everyone;

    const permission = channel.permissionsFor(everyone);

    if (!permission.has(PermissionsBitField.Flags.SendMessages)) {
      return interaction.reply({
        content: 'This channel is already locked.',
        ephemeral: true,
      });
    }

    await channel.permissionOverwrites.edit(everyone, {
      SendMessages: false,
    });

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('Channel Locked')
      .setDescription(`🔒 **${channel.name}** has been locked.`)
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};