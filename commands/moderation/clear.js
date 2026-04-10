const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Advanced message clearing tool.')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Number of messages to scan (1-500)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Type of messages to delete')
        .setRequired(true)
        .addChoices(
          { name: 'All', value: 'all' },
          { name: 'User Messages', value: 'user' },
          { name: 'Bot Messages', value: 'bot' },
          { name: 'Links Only', value: 'links' }
        )
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const type = interaction.options.getString('type');

    const OWNER_ID = "969181284784025670";

    const isOwner = interaction.user.id === OWNER_ID;
    const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

    if (!isOwner && !isAdmin) {
      return interaction.reply({
        content: "Only server admins or the bot owner can use this command.",
        ephemeral: true,
      });
    }

    if (amount < 1 || amount > 500) {
      return interaction.reply({
        content: 'Please provide a number between 1 and 500.',
        ephemeral: true,
      });
    }

    const messages = await interaction.channel.messages.fetch({ limit: amount });

    let filtered = messages;

    // 🔥 FILTER SYSTEM
    if (type === 'user') {
      filtered = messages.filter(m => !m.author.bot);
    }

    if (type === 'bot') {
      filtered = messages.filter(m => m.author.bot);
    }

    if (type === 'links') {
      filtered = messages.filter(m =>
        m.content.includes('http://') || m.content.includes('https://')
      );
    }

    const deletable = filtered.filter(m => {
      const now = Date.now();
      return now - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000;
    });

    await interaction.channel.bulkDelete(deletable, true);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🧹 Clear Completed')
      .setDescription(`Deleted **${deletable.size}** messages (${type}).`)
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};