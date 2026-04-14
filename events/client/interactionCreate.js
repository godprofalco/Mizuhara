const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder
} = require('discord.js');

const TicketPanel = require('../../models/TicketPanel');
const TicketBan = require('../../models/TicketBan');
const Welcome = require('../../models/welcome');

const createTicket = require('../../functions/createTicket');
const closeTicket = require('../../functions/closeTicket');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {

    // =========================
    // STRING MENU (TICKET)
    // =========================
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_menu') {

      const modal = new ModalBuilder()
        .setCustomId(`reason_${interaction.values[0]}`)
        .setTitle('Ticket Reason');

      const reasonInput = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Describe your issue')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(reasonInput)
      );

      return interaction.showModal(modal);
    }

    // =========================
    // CREATE TICKET (MODAL)
    // =========================
    if (interaction.isModalSubmit() && interaction.customId.startsWith('reason_')) {

      const type = interaction.customId.replace('reason_', '');
      const reason = interaction.fields.getTextInputValue('reason');

      const panel = await TicketPanel.findOne({ guildId: interaction.guild.id });

      if (!panel) {
        return interaction.reply({ content: '❌ Ticket panel not set.', ephemeral: true });
      }

      const option = panel.dropdowns.find(d => d.name === type);

      const banned = await TicketBan.findOne({
        guildId: interaction.guild.id,
        userId: interaction.user.id,
      });

      if (banned) {
        return interaction.reply({ content: '❌ You are banned from tickets.', ephemeral: true });
      }

      const { channel } = await createTicket(interaction, option, reason);

      const row = new ActionRowBuilder().addComponents(
        // keep your ticket buttons here
      );

      const embed = new EmbedBuilder()
        .setTitle(type)
        .setDescription(reason)
        .setColor(0x2b2d31);

      await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
        components: [row],
      });

      return interaction.reply({
        content: `✅ Ticket created: ${channel}`,
        ephemeral: true
      });
    }

    // =========================
    // CLOSE TICKET BUTTON
    // =========================
    if (interaction.isButton()) {

      if (interaction.customId === 'close') {
        return closeTicket(interaction);
      }

      // =========================
      // EMBED BUILDER BUTTON
      // =========================
      if (interaction.customId.startsWith('embed_modal_')) {

        const channelId = interaction.customId.split('embed_modal_')[1];

        const modal = new ModalBuilder()
          .setCustomId(`embed_submit_${channelId}`)
          .setTitle('Embed Builder');

        const title = new TextInputBuilder()
          .setCustomId('title')
          .setLabel('Title')
          .setStyle(TextInputStyle.Short)
          .setRequired(false);

        const description = new TextInputBuilder()
          .setCustomId('description')
          .setLabel('Description')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false);

        const footer = new TextInputBuilder()
          .setCustomId('footer')
          .setLabel('Footer')
          .setStyle(TextInputStyle.Short)
          .setRequired(false);

        const topImage = new TextInputBuilder()
          .setCustomId('top_image')
          .setLabel('Top Image URL')
          .setStyle(TextInputStyle.Short)
          .setRequired(false);

        const bottomImage = new TextInputBuilder()
          .setCustomId('bottom_image')
          .setLabel('Bottom Image URL')
          .setStyle(TextInputStyle.Short)
          .setRequired(false);

        modal.addComponents(
          new ActionRowBuilder().addComponents(title),
          new ActionRowBuilder().addComponents(description),
          new ActionRowBuilder().addComponents(footer),
          new ActionRowBuilder().addComponents(topImage),
          new ActionRowBuilder().addComponents(bottomImage)
        );

        return interaction.showModal(modal);
      }
    }

    // =========================
    // EMBED BUILDER SUBMIT
    // =========================
    if (interaction.isModalSubmit() && interaction.customId.startsWith('embed_submit_')) {

      const channelId = interaction.customId.split('embed_submit_')[1];
      const channel = interaction.guild.channels.cache.get(channelId);

      if (!channel) {
        return interaction.reply({
          content: '❌ Channel not found.',
          ephemeral: true
        });
      }

      const title = interaction.fields.getTextInputValue('title');
      const description = interaction.fields.getTextInputValue('description');
      const footer = interaction.fields.getTextInputValue('footer');
      const topImage = interaction.fields.getTextInputValue('top_image');
      const bottomImage = interaction.fields.getTextInputValue('bottom_image');

      const embed = new EmbedBuilder().setColor(0x5865f2);

      if (title) embed.setTitle(title);
      if (description) embed.setDescription(description);
      if (footer) embed.setFooter({ text: footer });

      if (topImage) await channel.send({ content: topImage });

      await channel.send({ embeds: [embed] });

      if (bottomImage) await channel.send({ content: bottomImage });

      return interaction.reply({
        content: `✅ Sent to <#${channelId}>`,
        ephemeral: true
      });
    }

    // =========================
    // WELCOME SYSTEM (basic hook example)
    // =========================
    if (interaction.isChatInputCommand() && interaction.commandName === 'welcome') {
      // handled in command file usually
    }
  }
};
