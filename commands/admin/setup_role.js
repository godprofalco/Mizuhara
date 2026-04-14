const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

const OWNER_ID = "969181284784025670";

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup_role')
    .setDescription('👑 Create admin role (Owner only)'),

  async execute(interaction) {

    // 🔒 OWNER LOCK
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: '❌ Only the bot owner can use this command.',
        ephemeral: true
      });
    }

    const modal = new ModalBuilder()
      .setCustomId('role_builder')
      .setTitle('👑 Role Setup');

    const roleName = new TextInputBuilder()
      .setCustomId('role_name')
      .setLabel('Role Name')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(roleName)
    );

    return interaction.showModal(modal);
  }
};
