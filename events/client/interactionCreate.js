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
const Ticket = require('../../models/Ticket');
const TicketBan = require('../../models/TicketBan');
const TicketSettings = require('../../models/TicketSettings');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {

    // =========================
    // ADD CATEGORY MODAL (ADMIN)
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
    // SAVE CATEGORY
    // =========================
    if (interaction.isModalSubmit() && interaction.customId === 'modal_add_category') {
      const emoji = interaction.fields.getTextInputValue('emoji');
      const name = interaction.fields.getTextInputValue('name');
      const desc = interaction.fields.getTextInputValue('desc');

      const panel = await TicketPanel.findOne({ guildId: interaction.guild.id });

      panel.categories.push({ emoji, name, description: desc });
      await panel.save();

      return interaction.reply({
        content: `✅ Added: ${emoji} ${name}`,
        ephemeral: true,
      });
    }

    // =========================
    // OPEN TICKET → REASON MODAL
    // =========================
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_open_menu') {
      const categoryName = interaction.values[0];

      const modal = new ModalBuilder()
        .setCustomId(`ticket_reason_${categoryName}`)
        .setTitle('🌸 Ticket Reason');

      const reason = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Describe your issue')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(reason));

      return interaction.showModal(modal);
    }

    // =========================
    // CREATE TICKET
    // =========================
    if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_reason_')) {

      const category = interaction.customId.replace('ticket_reason_', '');
      const reason = interaction.fields.getTextInputValue('reason');

      const settings = await TicketSettings.findOne({ guildId: interaction.guild.id });

      const channelName = `${category}-${interaction.user.username}-${Date.now().toString().slice(-4)}`;

      const channel = await interaction.guild.channels.create({
        name: channelName.toLowerCase(),
        type: ChannelType.GuildText,
        parent: settings.categoryId,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
          ...settings.supportRoleIds.map(id => ({
            id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          })),
        ],
      });

      await Ticket.create({
        guildId: interaction.guild.id,
        channelId: channel.id,
        userId: interaction.user.id,
        reason,
        status: 'open',
      });

      // =========================
      // BUTTON PANEL (UPDATED)
      // =========================
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('ticket_open').setLabel('Open').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('ticket_add').setLabel('Add User').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('ticket_kick').setLabel('Kick User').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('ticket_ban').setLabel('Ban User').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('ticket_unban').setLabel('Unban User').setStyle(ButtonStyle.Success),
      );

      const embed = new EmbedBuilder()
        .setTitle(`🌟 ${category} Ticket`)
        .setColor('Gold')
        .setDescription(
          `🍁 **User:** <@${interaction.user.id}>\n⚡ **Reason:** ${reason}\n❄️ **Time:** <t:${Math.floor(Date.now() / 1000)}:F>`
        )
        .setFooter({ text: 'Ticket System Active' });

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
    // BUTTON ACTIONS (FIXED LOGIC)
    // =========================
    if (!interaction.isButton()) return;

    const member = interaction.member;
    const channel = interaction.channel;

    // CLOSE
    if (interaction.customId === 'ticket_close') {
      await interaction.reply({ content: '❄️ Closing ticket...' });
      return setTimeout(() => channel.delete().catch(() => {}), 2000);
    }

    // OPEN (reopen message only)
    if (interaction.customId === 'ticket_open') {
      return interaction.reply({ content: '🌟 Ticket is already open.', ephemeral: true });
    }

    // ADD USER (FIXED → NEED TARGET USER)
    if (interaction.customId === 'ticket_add') {
      return interaction.reply({
        content: '⚡ Use: `/ticket add @user` (recommended fix)',
        ephemeral: true,
      });
    }

    // KICK USER (FIXED)
    if (interaction.customId === 'ticket_kick') {
      return interaction.reply({
        content: '⚡ Use: `/ticket remove @user`',
        ephemeral: true,
      });
    }

    // BAN SELF FIX (IMPORTANT)
    if (interaction.customId === 'ticket_ban') {
      await TicketBan.create({
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        reason: 'Manual ban',
      });

      return interaction.reply({ content: '🚫 You are banned.', ephemeral: true });
    }

    // UNBAN SELF FIX
    if (interaction.customId === 'ticket_unban') {
      await TicketBan.deleteOne({
        guildId: interaction.guild.id,
        userId: interaction.user.id,
      });

      return interaction.reply({ content: '✅ Unbanned.', ephemeral: true });
    }
  },
};
