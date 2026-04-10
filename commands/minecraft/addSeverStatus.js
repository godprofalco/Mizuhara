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
    .addStringOption(o => o.setName('servername').setDescription('Server name').setRequired(true))
    .addStringOption(o => o.setName('serverip').setDescription('Server IP').setRequired(true))
    .addStringOption(o =>
      o.setName('gamemode')
        .setDescription('Java or Bedrock')
        .setRequired(true)
        .addChoices(
          { name: 'Java', value: 'java' },
          { name: 'Bedrock', value: 'bedrock' }
        )
    )
    .addChannelOption(o =>
      o.setName('channel')
        .setDescription('Channel for updates')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addBooleanOption(o =>
      o.setName('hideip')
        .setDescription('Hide real IP')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: '❌ Owner only.', ephemeral: true });
    }

    const serverName = interaction.options.getString('servername');
    const serverIp = interaction.options.getString('serverip');
    const gameMode = interaction.options.getString('gamemode');
    const channel = interaction.options.getChannel('channel');
    const hideIp = interaction.options.getBoolean('hideip') || false;

    const exists = await ServerStatus.findOne({
      guildId: interaction.guild.id,
      serverIp,
      channelId: channel.id,
    });

    if (exists) {
      return interaction.reply({ content: 'Already exists.', ephemeral: true });
    }

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
          .setTitle('✅ Added')
          .setDescription(`**${serverName}** (\`${serverIp}\`)`)
          .addFields({
            name: 'IP Visibility',
            value: hideIp ? 'Hidden 🔒' : 'Visible 🌐',
          }),
      ],
      ephemeral: true,
    });
  },
};      serverIp,
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
