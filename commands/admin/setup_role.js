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

    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: '❌ Only owner can use this.',
        ephemeral: true
      });
    }

    const modal = new ModalBuilder()
      .setCustomId('role_builder') // MUST MATCH
      .setTitle('👑 Setup Admin Role');

    const roleName = new TextInputBuilder()
      .setCustomId('role_name')
      .setLabel('Enter Role Name')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(roleName)
    );

    await interaction.showModal(modal);
  }
};
