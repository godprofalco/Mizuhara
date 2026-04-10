const axios = require('axios');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstatus')
    .setDescription('Get Minecraft server status')
    .addStringOption(option =>
      option
        .setName('serverip')
        .setDescription('Server IP')
        .setRequired(true)
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
    ),

  async execute(interaction) {
    const serverIp = interaction.options.getString('serverip');
    const gameMode = interaction.options.getString('gamemode');

    const apiUrl =
      gameMode === 'java'
        ? `https://api.mcsrvstat.us/1/${serverIp}`
        : `https://api.mcsrvstat.us/bedrock/1/${serverIp}`;

    try {
      const { data } = await axios.get(apiUrl);

      if (data.offline) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('Red')
              .setTitle('❌ Server Offline')
              .setDescription(`\`${serverIp}\` is offline`)
          ],
          ephemeral: true,
        });
      }

      // 🔥 TPS (only if available)
      const tps = data.tps || 'N/A';

      // 🔥 PING (approx based on response time)
      const pingStart = Date.now();
      await axios.get(apiUrl);
      const ping = Date.now() - pingStart;

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle(`🟢 ${serverIp}`)
        .addFields(
          {
            name: 'Players',
            value: `${data.players?.online || 0}/${data.players?.max || 0}`,
            inline: true,
          },
          {
            name: 'Version',
            value: data.version || 'Unknown',
            inline: true,
          },
          {
            name: 'Ping',
            value: `${ping}ms`,
            inline: true,
          },
          {
            name: 'TPS',
            value: `${tps}`,
            inline: true,
          }
        )
        .setThumbnail(`https://api.mcstatus.io/v2/icon/${serverIp}`);

      return interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: 'Error fetching server status.',
        ephemeral: true,
      });
    }
  },
};
