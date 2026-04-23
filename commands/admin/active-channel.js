const GuildAI = require('../../models/GuildAI');

function isAuthorized(interaction) {
  const isOwner = interaction.guild.ownerId === interaction.user.id;
  const isBotOwner = interaction.user.id === process.env.BOT_OWNER_ID;
  const isAdmin = interaction.member.permissions.has("Administrator");

  return isOwner || isBotOwner || isAdmin;
}

module.exports = {
  name: 'active-channel',
  description: 'Manage AI active channel',
  options: [
    {
      name: 'set',
      type: 1, // SUB_COMMAND
      description: 'Set active channel',
      options: [
        {
          name: 'channel',
          type: 7, // CHANNEL
          required: true,
          description: 'Select channel'
        }
      ]
    },
    {
      name: 'remove',
      type: 1,
      description: 'Disable AI in this server'
    },
    {
      name: 'view',
      type: 1,
      description: 'View active channel'
    }
  ],

  execute: async (interaction) => {
    const sub = interaction.options.getSubcommand();

    if (sub === 'set') {
      if (!isAuthorized(interaction)) {
        return interaction.reply({
          content: "❌ Only owner/admin/bot owner can set active channel.",
          ephemeral: true
        });
      }

      const channel = interaction.options.getChannel('channel');

      await GuildAI.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { activeChannel: channel.id },
        { upsert: true }
      );

      return interaction.reply(`✅ AI activated in ${channel}`);
    }

    if (sub === 'remove') {
      if (!isAuthorized(interaction)) {
        return interaction.reply({
          content: "❌ Only owner/admin/bot owner can disable AI.",
          ephemeral: true
        });
      }

      await GuildAI.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { activeChannel: null }
      );

      return interaction.reply("🚫 AI disabled in this server.");
    }

    if (sub === 'view') {
      const data = await GuildAI.findOne({ guildId: interaction.guild.id });

      if (!data || !data.activeChannel) {
        return interaction.reply("ℹ️ No active channel set. AI is OFF.");
      }

      return interaction.reply(`📢 Active Channel: <#${data.activeChannel}>`);
    }
  }
};
