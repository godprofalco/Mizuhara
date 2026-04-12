const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketsetup')
    .setDescription('Setup ticket system')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('setup_add_dropdown').setLabel('Add Dropdown').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('setup_roles').setLabel('Set Roles').setStyle(ButtonStyle.Primary)
    );

    interaction.reply({ content: '⚙️ Setup UI', components: [row], ephemeral: true });
  },
};
