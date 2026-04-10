const { SlashCommandBuilder } = require('discord.js');
const ServerStatus = require('../../models/ServerStatus');

const OWNER_ID = '969181284784025670';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeserverstatus')
    .setDescription('Remove a tracked server.')
    .addStringOption(o =>
      o.setName('servername').setDescription('Server name').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('serverip').setDescription('Server IP').setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: '❌ Owner only.', ephemeral: true });
    }

    const serverName = interaction.options.getString('servername');
    const serverIp = interaction.options.getString('serverip');

    const server = await ServerStatus.findOneAndDelete({
      guildId: interaction.guild.id,
      serverName,
      serverIp,
    });

    if (!server) {
      return interaction.reply({
        content: 'Server not found.',
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: `✅ Removed **${serverName}**`,
      ephemeral: true,
    });
  },
};
