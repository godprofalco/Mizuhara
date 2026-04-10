const {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
} = require('discord.js');

const ServerStatus = require('../../models/ServerStatus');

const OWNER_ID = '969181284784025670';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addserverstatus')
    .setDescription('Add a Minecraft server to track its status.')

    .addStringOption(option =>
      option.setName('servername').setDescription('Server name').setRequired(true)
    )

    .addStringOption(option =>
      option.setName('serverip').setDescription('Server IP').setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('gamemode')
        .setDescription('Java or Bedrock')
        .setRequired(true)
        .addChoices(
          { name: 'Java', value: 'java' },
          { name: 'Bedrock', value: 'bedrock' }
        )
    )

    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Channel for updates')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )

    // ✅ THIS IS THE ONLY THING YOU NEEDED
    .addBooleanOption(option =>
      option
        .setName('hideip')
        .setDescription('Hide the real IP')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: '❌ Owner only.',
        ephemeral: true,
      });
    }

    const serverName = interaction.options.getString('servername');
    const serverIp = interaction.options.getString('serverip');
    const gameMode = interaction.options.getString('gamemode');
    const channel = interaction.options.getChannel('channel');

    // ✅ FIXED BOOLEAN READ
    const hideIp = interaction.options.getBoolean('hideip') ?? false;

    await ServerStatus.create({
      guildId: interaction.guild.id,
      channelId: channel.id,
      serverName,
      serverIp,
      gameMode,
      hideIp,
    });

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#00FF7F')
          .setTitle('Added')
          .setDescription(`${serverName} (${serverIp})`)
          .addFields({
            name: 'Hide IP',
            value: hideIp ? 'Yes 🔒' : 'No 🌐',
          }),
      ],
      ephemeral: true,
    });
  },
};
