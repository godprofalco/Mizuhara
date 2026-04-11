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
  StringSelectMenuBuilder,
} = require('discord.js');

const TicketPanel = require('../../models/TicketPanel');
const Ticket = require('../../models/Ticket');
const TicketBan = require('../../models/TicketBan');
const TicketSettings = require('../../models/TicketSettings');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {

    // =========================
    // ADD CATEGORY MODAL
    // =========================
    if (interaction.isButton() && interaction.customId === 'setup_add_category') {
      const modal = new ModalBuilder()
        .setCustomId('modal_add_category')
        .setTitle('➕ Add Category');

      const emoji = new TextInputBuilder()
        .setCustomId('emoji')
        .setLabel('Category Emoji')
        .setStyle(TextInputStyle.Short);

      const name = new TextInputBuilder()
        .setCustomId('name')
        .setLabel('Category Name')
        .setStyle(TextInputStyle.Short);

      const desc = new TextInputBuilder()
        .setCustomId('desc')
        .setLabel('Description')
        .setStyle(TextInputStyle.Paragraph);

      modal.addComponents(
        new ActionRowBuilder().addComponents(emoji),
        new ActionRowBuilder().addComponents(name),
        new ActionRowBuilder().addComponents(desc)
      );

      return interaction.showModal(modal);
    }

    // =========================
    // SAVE CATEGORY FROM MODAL
    // =========================
    if (interaction.isModalSubmit() && interaction.customId === 'modal_add_category') {
      const emoji = interaction.fields.getTextInputValue('emoji');
      const name = interaction.fields.getTextInputValue('name');
      const desc = interaction.fields.getTextInputValue('desc');

      const panel = await TicketPanel.findOne({ guildId: interaction.guild.id });

      panel.categories.push({
        emoji,
        name,
        description: desc,
      });

      await panel.save();

      return interaction.reply({
        content: `✅ Category added: ${emoji} ${name}`,
        ephemeral: true,
      });
    }

    // =========================
    // CREATE PANEL (USER SIDE)
    // =========================
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_open_menu') {
      const categoryName = interaction.values[0];

      const panel = await TicketPanel.findOne({ guildId: interaction.guild.id });
      const category = panel.categories.find(c => c.name === categoryName);

      const modal = new ModalBuilder()
        .setCustomId(`ticket_reason_${categoryName}`)
        .setTitle('🌸 Ticket Reason');

      const input = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Describe your issue')
        .setStyle(TextInputStyle.Paragraph);

      modal.addComponents(new ActionRowBuilder().addComponents(input));

      return interaction.showModal(modal);
    }

    // =========================
    // CREATE TICKET
    // =========================
    if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_reason_')) {
      const category = interaction.customId.replace('ticket_reason_', '');
      const reason = interaction.fields.getTextInputValue('reason');

      const settings = await TicketSettings.findOne({ guildId: interaction.guild.id });

      const channel = await interaction.guild.channels.create({
        name: `${category}-${interaction.user.username}-1`,
        type: ChannelType.GuildText,
        parent: settings.categoryId,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          },
          ...settings.supportRoleIds.map(r => ({
            id: r,
            allow: [PermissionFlagsBits.ViewChannel],
          })),
        ],
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('close').setLabel('Close').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('add').setLabel('Add').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('kick').setLabel('Kick').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('ban').setLabel('Ban').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('unban').setLabel('Unban').setStyle(ButtonStyle.Primary),
      );

      const embed = new EmbedBuilder()
        .setTitle(`🌟 Ticket: ${category}`)
        .setDescription(
          `🍁 User: <@${interaction.user.id}>\n⚡ Reason: ${reason}\n❄️ Time: <t:${Math.floor(Date.now()/1000)}:F>`
        );

      await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
        components: [row],
      });

      return interaction.reply({
        content: `✅ Ticket created: ${channel}`,
        ephemeral: true,
      });
    }

    // =========================
    // BUTTON SYSTEM
    // =========================
    if (interaction.isButton()) {

      const channel = interaction.channel;

      if (interaction.customId === 'close') {
        await interaction.reply({ content: '❄️ Closing ticket...' });
        return setTimeout(() => channel.delete(), 2000);
      }

      if (interaction.customId === 'add') {
        await channel.permissionOverwrites.edit(interaction.user.id, {
          ViewChannel: true,
          SendMessages: true,
        });

        return interaction.reply({ content: '➕ Added', ephemeral: true });
      }

      if (interaction.customId === 'ban') {
        await TicketBan.create({
          guildId: interaction.guild.id,
          userId: interaction.user.id,
          reason: 'Manual ban',
        });

        return interaction.reply({ content: '🚫 Banned', ephemeral: true });
      }

      if (interaction.customId === 'unban') {
        await TicketBan.deleteOne({ userId: interaction.user.id });

        return interaction.reply({ content: '✅ Unbanned', ephemeral: true });
      }
    }
  }
};
