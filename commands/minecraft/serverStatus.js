const axios = require('axios');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ServerStatus = require('../../models/ServerStatus');

const OWNER_ID = '969181284784025670';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstatus')
    .setDescription('Check Minecraft server status')
    .addStringOption(o => o.setName('serverip').setDescription('Server IP').setRequired(false))
    .addStringOption(o =>
      o.setName('gamemode')
        .setDescription('Java or Bedrock')
        .setRequired(false)
        .addChoices(
          { name: 'Java', value: 'java' },
          { name: 'Bedrock', value: 'bedrock' }
        )
    )
    .addBooleanOption(o =>
      o.setName('hideip')
        .setDescription('Hide IP (manual mode)')
        .setRequired(false)
    ),

const axios = require('axios');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ServerStatus = require('../../models/ServerStatus');

const OWNER_ID = '969181284784025670';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstatus')
    .setDescription('Check Minecraft server status')
    .addStringOption(o => o.setName('serverip').setDescription('Server IP').setRequired(false))
    .addStringOption(o =>
      o.setName('gamemode')
        .setDescription('Java or Bedrock')
        .setRequired(false)
        .addChoices(
          { name: 'Java', value: 'java' },
          { name: 'Bedrock', value: 'bedrock' }
        )
    )
    .addBooleanOption(o =>
      o.setName('hideip')
        .setDescription('Hide IP (manual mode)')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: '❌ Owner only.', ephemeral: true });
    }

    const inputIp = interaction.options.getString('serverip');
    const inputMode = interaction.options.getString('gamemode');
    const inputHide = interaction.options.getBoolean('hideip') || false;

    let servers = [];

    if (inputIp && inputMode) {
      servers.push({
        serverName: inputIp,
        serverIp: inputIp,
        gameMode: inputMode,
        hideIp: inputHide,
      });
    } else {
      const dbServers = await ServerStatus.find({
        guildId: interaction.guild.id,
      });

      if (!dbServers.length) {
        return interaction.reply({
          content: 'No servers set.',
          ephemeral: true,
        });
      }

      servers = dbServers;
    }

    await interaction.deferReply();

    const embeds = [];

    for (const server of servers) {
      const api =
        server.gameMode === 'java'
          ? `https://api.mcsrvstat.us/1/${server.serverIp}`
          : `https://api.mcsrvstat.us/bedrock/1/${server.serverIp}`;

      try {
        const { data } = await axios.get(api);

        const ip = server.hideIp ? '🔒 Hidden' : `\`${server.serverIp}\``;

        if (data.offline) {
          embeds.push(
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle(`❌ ${server.serverName}`)
              .setDescription('Offline')
              .addFields({ name: 'IP', value: ip })
          );
          continue;
        }

        embeds.push(
          new EmbedBuilder()
            .setColor('#00FF7F')
            .setTitle(`🟢 ${server.serverName}`)
            .addFields(
              { name: 'IP', value: ip, inline: true },
              {
                name: 'Players',
                value: `${data.players?.online || 0}/${data.players?.max || 0}`,
                inline: true,
              },
              {
                name: 'Version',
                value: data.version || 'Unknown',
                inline: true,
              }
            )
            .setThumbnail(`https://api.mcstatus.io/v2/icon/${server.serverIp}`)
        );
      } catch {
        embeds.push(
          new EmbedBuilder()
            .setColor('#808080')
            .setTitle(`⚠️ ${server.serverName}`)
            .setDescription('Error fetching data')
        );
      }
    }

    return interaction.editReply({ embeds });
  },
};
