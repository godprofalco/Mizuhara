const axios = require('axios');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ServerStatus = require('../../models/ServerStatus');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstatus')
    .setDescription('Get the status of a Minecraft server.')
    .addStringOption((option) =>
      option
        .setName('serverip')
        .setDescription('The IP address of the Minecraft server.')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('gamemode')
        .setDescription('The game mode of the server (Java or Bedrock).')
        .setRequired(false)
        .addChoices(
          { name: 'Java', value: 'java' },
          { name: 'Bedrock', value: 'bedrock' }
        )
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;

    const inputIp = interaction.options.getString('serverip');
    const inputMode = interaction.options.getString('gamemode');

    let servers = [];

    // 🔥 MODE 1: If user provides input → manual mode
    if (inputIp && inputMode) {
      servers.push({
        serverName: inputIp,
        serverIp: inputIp,
        gameMode: inputMode,
        hideIp: false,
      });
    } 
    // 🔥 MODE 2: Otherwise → DB mode (AddServerStatus system)
    else {
      const dbServers = await ServerStatus.find({ guildId });

      if (!dbServers || dbServers.length === 0) {
        return interaction.reply({
          content:
            '❌ No server configured. Use `/addserverstatus` or provide IP manually.',
          ephemeral: true,
        });
      }

      servers = dbServers;
    }

    await interaction.deferReply();

    const embeds = [];

    for (const server of servers) {
      const apiUrl =
        server.gameMode === 'java'
          ? `https://api.mcsrvstat.us/1/${server.serverIp}`
          : `https://api.mcsrvstat.us/bedrock/1/${server.serverIp}`;

      try {
        const { data } = await axios.get(apiUrl);

        const ipDisplay = server.hideIp
          ? '🔒 Hidden'
          : `\`${server.serverIp}\``;

        if (data.offline) {
          embeds.push(
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle(`❌ ${server.serverName}`)
              .setDescription('Server Offline')
              .addFields(
                { name: '🌐 IP', value: ipDisplay, inline: true },
                { name: '🛜 Status', value: 'Offline', inline: true }
              )
              .setTimestamp()
          );
          continue;
        }

        embeds.push(
          new EmbedBuilder()
            .setColor('#00FF7F')
            .setTitle(`🟢 ${server.serverName}`)
            .addFields(
              {
                name: '🌐 IP',
                value: ipDisplay,
                inline: true,
              },
              {
                name: '📊 Players',
                value: `\`${data.players?.online || 0}\` / \`${data.players?.max || 0}\``,
                inline: true,
              },
              {
                name: '🔧 Version',
                value: `\`${data.version || 'Unknown'}\``,
                inline: true,
              }
            )
            .setThumbnail(`https://api.mcstatus.io/v2/icon/${server.serverIp}`)
            .setTimestamp()
        );
      } catch (err) {
        embeds.push(
          new EmbedBuilder()
            .setColor('#808080')
            .setTitle(`⚠️ ${server.serverName}`)
            .setDescription('Error fetching server data')
        );
      }
    }

    return interaction.editReply({ embeds });
  },
};
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply(
        `There was an error fetching the status for ${serverIp}.`
      );
    }
  },
};
