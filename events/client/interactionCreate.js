const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const TicketPanel = require('../../models/TicketPanel');
const TicketSettings = require('../../models/TicketSettings');
const Ticket = require('../../models/Ticket');
const TicketBan = require('../../models/TicketBan');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {

    // ================= ADD DROPDOWN =================
    if (interaction.isButton() && interaction.customId === 'setup_add_dropdown') {

      const modal = new ModalBuilder()
        .setCustomId('add_dropdown')
        .setTitle('Add Dropdown');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('emoji').setLabel('Emoji').setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('name').setLabel('Name').setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('category').setLabel('Category ID').setStyle(TextInputStyle.Short)
        )
      );

      return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'add_dropdown') {

      const panel = await TicketPanel.findOne({ guildId: interaction.guild.id });

      panel.dropdowns.push({
        emoji: interaction.fields.getTextInputValue('emoji'),
        name: interaction.fields.getTextInputValue('name'),
        categoryId: interaction.fields.getTextInputValue('category'),
      });

      await panel.save();

      return interaction.reply({ content: '✅ Added', ephemeral: true });
    }

    // ================= SELECT → MODAL =================
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_menu') {

      const modal = new ModalBuilder()
        .setCustomId(`reason_${interaction.values[0]}`)
        .setTitle('Ticket Reason');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('reason')
            .setLabel('Your Issue')
            .setStyle(TextInputStyle.Paragraph)
        )
      );

      return interaction.showModal(modal);
    }

    // ================= CREATE TICKET =================
    if (interaction.isModalSubmit() && interaction.customId.startsWith('reason_')) {

      const type = interaction.customId.replace('reason_', '');
      const reason = interaction.fields.getTextInputValue('reason');

