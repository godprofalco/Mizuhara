const GuildAI = require('../../models/GuildAI');

function isAuthorized(interaction) {
  const isOwner = interaction.guild.ownerId === interaction.user.id;
  const isBotOwner = interaction.user.id === process.env.BOT_OWNER_ID;
  const isAdmin = interaction.member.permissions.has("Administrator");

  return isOwner || isBotOwner || isAdmin;
}

module.exports = {
  name: 'prompt',
  description: 'Set or view AI personality for this server',
  options: [
    {
      name: 'set',
      type: 1, // SUB_COMMAND
      description: 'Set AI prompt',
      options: [
        {
          name: 'text',
          type: 3, // STRING
          required: true,
          description: 'AI personality prompt'
        }
      ]
    },
    {
      name: 'view',
      type: 1,
      description: 'View current prompt'
    },
    {
      name: 'reset',
      type: 1,
      description: 'Reset to global prompt'
    }
  ],

  execute: async (interaction) => {
    const sub = interaction.options.getSubcommand();

    if (sub === 'set') {
      if (!isAuthorized(interaction)) {
        return interaction.reply({
          content: "❌ Only server owner/admins can set prompt.",
          ephemeral: true
        });
      }

      const text = interaction.options.getString('text');

      await GuildAI.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { prompt: text },
        { upsert: true }
      );

      return interaction.reply(`✅ AI prompt updated.`);
    }

    if (sub === 'view') {
      const data = await GuildAI.findOne({ guildId: interaction.guild.id });

      if (!data || !data.prompt) {
        return interaction.reply("ℹ️ No custom prompt set. Using global prompt.");
      }

      return interaction.reply(`🧠 Current Prompt:\n\n${data.prompt}`);
    }

    if (sub === 'reset') {
      if (!isAuthorized(interaction)) {
        return interaction.reply({
          content: "❌ Only owner/admin/bot owner can reset prompt.",
          ephemeral: true
        });
      }

      await GuildAI.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { prompt: null }
      );

      return interaction.reply("♻️ Prompt reset to global.");
    }
  }
};
