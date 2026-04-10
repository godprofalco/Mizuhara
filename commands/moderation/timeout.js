const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Put a member in timeout for a specified duration.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to timeout')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('duration')
        .setDescription('Duration (e.g., 1d2h30m40s)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for the timeout')
        .setRequired(false)
    ),

  async execute(interaction) {
    const { default: prettyMs } = await import('pretty-ms');

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
    const duration = interaction.options.getString('duration');
    const reason =
      interaction.options.getString('reason') || 'No reason provided.';

    const member = interaction.guild.members.cache.get(user.id);
    const executor = interaction.member;
    const botMember = interaction.guild.members.me;

    if (!member) {
      return interaction.reply({
        content: 'That member is not in this server.',
        ephemeral: true,
      });
    }

    if (member.id === executor.id) {
      return interaction.reply({
        content: 'You cannot timeout yourself.',
        ephemeral: true,
      });
    }

    if (!member.moderatable) {
      return interaction.reply({
        content: 'I cannot timeout this user.',
        ephemeral: true,
      });
    }

    if (member.roles.highest.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content: 'I cannot timeout this user due to role hierarchy.',
        ephemeral: true,
      });
    }

    const durationRegex = /^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/;

    if (!durationRegex.test(duration)) {
      return interaction.reply({
        content: 'Invalid duration format! Use like `1d2h30m40s`.',
        ephemeral: true,
      });
    }

    const durationMs = parseDuration(duration);

    if (durationMs < 5000 || durationMs > 28 * 24 * 60 * 60 * 1000) {
      return interaction.reply({
        content: 'Timeout must be between 5 seconds and 28 days.',
        ephemeral: true,
      });
    }

    await member.timeout(durationMs, reason);

    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle('Member Timed Out')
      .setDescription(
        `⏳ **${user.tag}** has been timed out for **${prettyMs(durationMs, { verbose: true })}**`
      )
      .addFields(
        { name: 'Reason', value: reason, inline: true },
        {
          name: 'Timed Out By',
          value: `<@${interaction.user.id}>`,
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

function parseDuration(duration) {
  const d = (duration.match(/(\d+)d/) || [])[1] || 0;
  const h = (duration.match(/(\d+)h/) || [])[1] || 0;
  const m = (duration.match(/(\d+)m/) || [])[1] || 0;
  const s = (duration.match(/(\d+)s/) || [])[1] || 0;

  return (
    parseInt(d) * 86400000 +
    parseInt(h) * 3600000 +
    parseInt(m) * 60000 +
    parseInt(s) * 1000
  );
}