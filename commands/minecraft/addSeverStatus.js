const {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
} = require('discord.js');
const ServerStatus = require('../../models/ServerStatus');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addserverstatus')
    .setDescription('Add a Minecraft server to track its status.')
    .addStringOption((option) =>
      option
        .setName('servername')
        .setDescription('The name of the server.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('serverip')
        .setDescription('The IP address of the server.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('gamemode')
        .setDescription('The game mode of the server (Java or Bedrock).')
        .setRequired(true)
        .addChoices(
          { name: 'Java', value: 'java' },
          { name: 'Bedrock', value: 'bedrock' }
        )
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The channel where the server status will be posted.')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName('hideip')
        .setDescription('Hide the real IP in status embeds')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.reply({
        content: 'You do not have `ManageGuild` permission to add server status!',
        ephemeral: true,
      });
    }

    const serverName = interaction.options.getString('servername');
    const serverIp = interaction.options.getString('serverip');
    const gameMode = interaction.options.getString('gamemode');
    const channel = interaction.options.getChannel('channel');
    const hideIp = interaction.options.getBoolean('hideip') || false;

    const guildId = interaction.guild.id;
    const channelId = channel.id;

    const existingEntry = await ServerStatus.findOne({
      guildId,
      serverIp,
      channelId,
    });

    if (existingEntry) {
      return interaction.reply({
        content: 'This server is already being tracked in the specified channel!',
        ephemeral: true,
      });
    }

    const newServerStatus = new ServerStatus({
      guildId,
      channelId,
      serverName,
      serverIp,
      gameMode,
      hideIp, // ✅ SAVED HERE
    });

    await newServerStatus.save();

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#008080')
          .setTitle('✅ Server Status Tracking Added')
          .setDescription(
            `Successfully added **${serverName}** (\`${serverIp}\`, ${gameMode.toUpperCase()}) in <#${channelId}>.`
          )
          .addFields({
            name: '🔒 IP Visibility',
            value: hideIp ? 'IP will be hidden 🔒' : 'IP will be shown 🌐',
            inline: false,
          })
          .addFields({
            name: '⏱ Note',
            value: 'First update will appear in the next cycle.',
            inline: false,
          })
          .setFooter({ text: 'Status updates every 30 seconds.' })
          .setTimestamp(),
      ],
      ephemeral: true,
    });
  },
};
