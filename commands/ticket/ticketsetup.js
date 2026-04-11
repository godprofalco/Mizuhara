const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require('discord.js');

const TicketPanel = require('../../models/TicketPanel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketsetup')
    .setDescription('Open ticket setup panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    let panel = await TicketPanel.findOne({ guildId: interaction.guild.id });

    if (!panel) {
      panel = await TicketPanel.create({
        guildId: interaction.guild.id,
        title: '🎫 Ticket System',
        description: 'Click buttons to configure categories',
        footer: 'Ticket Setup Panel',
        categories: [],
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🎫 Ticket Setup Panel')
      .setColor('Gold')
      .setDescription(
        `🍁 **Title:** ${panel.title}\n🌸 **Categories:** ${
          panel.categories.length
        }\n⚡ Use buttons below to configure`
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('setup_add_category')
        .setLabel('➕ Add Category')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('setup_edit_category')
        .setLabel('✏️ Edit Category')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('setup_remove_category')
        .setLabel('❌ Remove Category')
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId('setup_finish')
        .setLabel('💾 Save Setup')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
};
