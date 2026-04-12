const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

const TicketPanel = require('../../models/TicketPanel');
const TicketBan = require('../../models/TicketBan');

const createTicket = require('../../functions/ticket/createTicket');
const closeTicket = require('../../functions/ticket/closeTicket');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {

    // SELECT MENU
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_menu') {
      const modal = new ModalBuilder()
        .setCustomId(`reason_${interaction.values[0]}`)
        .setTitle('Ticket Reason');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('reason')
            .setLabel('Describe your issue')
            .setStyle(TextInputStyle.Paragraph)
        )
      );

      return interaction.showModal(modal);
    }

    // CREATE TICKET
    if (interaction.isModalSubmit() && interaction.customId.startsWith('reason_')) {
      const type = interaction.customId.replace('reason_', '');
      const reason = interaction.fields.getTextInputValue('reason');

      const panel = await TicketPanel.findOne({ guildId: interaction.guild.id });
      const option = panel.dropdowns.find(d => d.name === type);

      const banned = await TicketBan.findOne({
        guildId: interaction.guild.id,
        userId: interaction.user.id,
      });

      if (banned) return interaction.reply({ content: '❌ Banned', ephemeral: true });

      const { channel } = await createTicket(interaction, option, reason);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('add').setLabel('Add').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('remove').setLabel('Remove').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('ban').setLabel('Ban').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('unban').setLabel('Unban').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('close').setLabel('Close').setStyle(ButtonStyle.Danger),
      );

      const embed = new EmbedBuilder()
        .setTitle(type)
        .setDescription(reason);

      await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
        components: [row],
      });

      return interaction.reply({ content: `✅ ${channel}`, ephemeral: true });
    }

    // BUTTONS
    if (interaction.isButton()) {
      if (interaction.customId === 'close') return closeTicket(interaction);
    }
  },
};
