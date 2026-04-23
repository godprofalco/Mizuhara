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
    .setName('prompt')
    .setDescription('Manage AI prompt')
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Set AI prompt')
        .addStringOption(opt =>
          opt.setName('text')
            .setDescription('Prompt text')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('view')
        .setDescription('View prompt')
    )
    .addSubcommand(sub =>
      sub.setName('reset')
        .setDescription('Reset prompt')
    ),

  async execute(interaction) {

    const client = interaction.client;
    if (!client.guildPrompts) client.guildPrompts = new Map();

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'set') {

      if (!isAuthorized(interaction)) {
        return interaction.reply({ content: "❌ No permission", ephemeral: true });
      }

      const text = interaction.options.getString('text');

      client.guildPrompts.set(guildId, text);

      return interaction.reply({ content: "🧠 Prompt updated.", ephemeral: true });
    }

    if (sub === 'view') {
      const prompt = client.guildPrompts.get(guildId);

      return interaction.reply({
        content: prompt || "ℹ️ Default prompt",
        ephemeral: true
      });
    }

    if (sub === 'reset') {

      if (!isAuthorized(interaction)) {
        return interaction.reply({ content: "❌ No permission", ephemeral: true });
      }

      client.guildPrompts.delete(guildId);

      return interaction.reply({
        content: "♻️ Prompt reset",
        ephemeral: true
      });
    }
  }
};
