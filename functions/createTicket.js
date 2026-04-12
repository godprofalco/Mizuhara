const { ChannelType, PermissionFlagsBits } = require('discord.js');
const Ticket = require('../../models/Ticket');
const TicketSettings = require('../../models/TicketSettings');

module.exports = async (interaction, option, reason) => {
  const settings = await TicketSettings.findOne({ guildId: interaction.guild.id });

  settings.ticketCounter++;
  await settings.save();

  const number = settings.ticketCounter.toString().padStart(2, '0');

  const channelName = `${option.name}-${interaction.user.username}-${number}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');

  const channel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: option.categoryId,
    permissionOverwrites: [
      { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      ...settings.supportRoleIds.map(r => ({
        id: r,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      })),
    ],
  });

  const ticket = await Ticket.create({
    guildId: interaction.guild.id,
    channelId: channel.id,
    userId: interaction.user.id,
    category: option.name,
    reason,
  });

  return { channel, ticket };
};
