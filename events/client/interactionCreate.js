const {
  Events,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const Ticket = require('../../models/Ticket');
const TicketSettings = require('../../models/TicketSettings');
const TicketCategory = require('../../models/TicketCategory');
const TicketBan = require('../../models/TicketBan');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    try {
      // =========================
      // TICKET DROPDOWN OPEN
      // =========================
      if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_open_menu') {
        const settings = await TicketSettings.findOne({ guildId: interaction.guild.id });
        if (!settings?.enabled) return;

        const banned = await TicketBan.findOne({
          guildId: interaction.guild.id,
          userId: interaction.user.id,
        });

        if (banned) {
          return interaction.reply({
            content: '❌ You are banned from creating tickets.',
            ephemeral: true,
          });
        }

        const categoryName = interaction.values[0];
        const category = await TicketCategory.findOne({
          guildId: interaction.guild.id,
          name: categoryName,
        });

        if (!category) {
          return interaction.reply({
            content: '❌ Category not found.',
            ephemeral: true,
          });
        }

        // Ask reason dropdown
        const reasonMenu = new StringSelectMenuBuilder()
          .setCustomId(`ticket_reason_${category.name}`)
          .setPlaceholder('🍁 Select Ticket Reason')
          .addOptions([
            { label: 'Support Issue', value: 'Support Issue', emoji: '⚡' },
            { label: 'Payment Problem', value: 'Payment Problem', emoji: '💸' },
            { label: 'Other', value: 'Other', emoji: '🌸' },
          ]);

        return interaction.reply({
          content: '🌟 Please select your reason:',
          components: [new ActionRowBuilder().addComponents(reasonMenu)],
          ephemeral: true,
        });
      }

      // =========================
      // REASON SELECTED → CREATE TICKET
      // =========================
      if (interaction.isStringSelectMenu() && interaction.customId.startsWith('ticket_reason_')) {
        const reason = interaction.values[0];
        const categoryName = interaction.customId.replace('ticket_reason_', '');

        const settings = await TicketSettings.findOne({ guildId: interaction.guild.id });
        const category = await TicketCategory.findOne({
          guildId: interaction.guild.id,
          name: categoryName,
        });

        const existing = await Ticket.findOne({
          guildId: interaction.guild.id,
          userId: interaction.user.id,
          status: 'open',
        });

        if (existing) {
          return interaction.reply({
            content: '❌ You already have an open ticket.',
            ephemeral: true,
          });
        }

        const channelName = `${category.name}-${interaction.user.username}-${reason}`
          .toLowerCase()
          .replace(/ /g, '-');

        const channel = await interaction.guild.channels.create({
          name: channelName,
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
            ...settings.supportRoleIds.map((id) => ({
              id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            })),
          ],
        });

        const ticket = await Ticket.create({
          guildId: interaction.guild.id,
          channelId: channel.id,
          userId: interaction.user.id,
          status: 'open',
          reason,
        });

        // Close button
        const closeBtn = new ButtonBuilder()
          .setCustomId('ticket_close')
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('❄️');

        const row = new ActionRowBuilder().addComponents(closeBtn);

        // First embed message
        const embed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle(`🌸 Ticket: ${reason}`)
          .setDescription(
            `⚡ User: <@${interaction.user.id}>\n🍁 Reason: **${reason}**\n🌟 Time: <t:${Math.floor(Date.now() / 1000)}:F>`
          )
          .setFooter({ text: 'Ticket System Active' });

        await channel.send({
          content: `${interaction.user} | <@&${settings.supportRoleIds.join('> <@&')}>`,
          embeds: [embed],
          components: [row],
        });

        return interaction.reply({
          content: `✅ Ticket created: ${channel}`,
          ephemeral: true,
        });
      }

      // =========================
      // CLOSE TICKET
      // =========================
      if (interaction.isButton() && interaction.customId === 'ticket_close') {
        const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
        if (!ticket) return;

        await interaction.reply({ content: '❄️ Closing ticket...' });

        const logChannel = interaction.guild.channels.cache.get(
          (await TicketSettings.findOne({ guildId: interaction.guild.id }))?.logChannelId
        );

        if (logChannel) {
          logChannel.send({
            content: `📄 Ticket closed: ${interaction.channel.name}`,
          });
        }

        setTimeout(() => interaction.channel.delete(), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  },
};
