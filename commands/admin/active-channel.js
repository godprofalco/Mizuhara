const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

const OWNER_ID = "969181284784025670";

function isAuthorized(interaction) {
  const isOwner = interaction.guild.ownerId === interaction.user.id;
  const isBotOwner = interaction.user.id === OWNER_ID;
  const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

  return isOwner || isBotOwner || isAdmin;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('active-channel')
    .setDescription('Manage AI active channel')
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Set active channel')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Channel')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Disable AI')
    )
    .addSubcommand(sub =>
      sub.setName('view')
        .setDescription('View active channel')
    ),

  async execute(interaction) {

    const client = interaction.client;
    if (!client.activeChannels) client.activeChannels = new Map();

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'set') {

      if (!isAuthorized(interaction)) {
        return interaction.reply({ content: "❌ No permission", ephemeral: true });
      }

      const channel = interaction.options.getChannel('channel');

      client.activeChannels.set(guildId, channel.id);

      return interaction.reply({
        content: `📢 Active in ${channel}`,
        ephemeral: true
      });
    }

    if (sub === 'remove') {

      if (!isAuthorized(interaction)) {
        return interaction.reply({ content: "❌ No permission", ephemeral: true });
      }

      client.activeChannels.delete(guildId);

      return interaction.reply({
        content: "🚫 AI disabled",
        ephemeral: true
      });
    }

    if (sub === 'view') {
      const channelId = client.activeChannels.get(guildId);

      return interaction.reply({
        content: channelId ? `<#${channelId}>` : "No active channel",
        ephemeral: true
      });
    }
  }
};
