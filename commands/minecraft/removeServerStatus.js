const { SlashCommandBuilder } = require('discord.js');
const ServerStatus = require('../../models/ServerStatus');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeserverstatus')
    .setDescription('Remove a Minecraft server from tracking.')
    .addStringOption((option) =>
      option
        .setName('servername')
        .setDescription('The name of the server to remove.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('serverip')
        .setDescription('The IP address of the server to remove.')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.reply({
        content: 'You do not have `ManageGuild` permission!',
        ephemeral: true,
      });
    }

    const serverName = interaction.options.getString('servername');
    const serverIp = interaction.options.getString('serverip');

    const guildId = interaction.guild.id;

    // 🔥 SAFE DELETE (guild specific)
    const server = await ServerStatus.findOneAndDelete({
      guildId,
      serverName,
      serverIp,
    });

    if (!server) {
      return interaction.reply({
        content: `❌ No server found with **${serverName}** (\`${serverIp}\`) in this server.`,
        ephemeral: true,
      });
    }

    // 🔥 DELETE MESSAGE IF EXISTS
    if (server.messageId && server.channelId) {
      try {
        const channel = await interaction.guild.channels.fetch(server.channelId);
        if (channel) {
          const message = await channel.messages.fetch(server.messageId);
          if (message) await message.delete();
        }
      } catch (error) {
        console.log('⚠️ Could not delete status message:', error.message);
      }
    }

    return interaction.reply({
      content: `✅ Removed **${serverName}** (\`${serverIp}\`) from tracking.`,
      ephemeral: true,
    });
  },
};
