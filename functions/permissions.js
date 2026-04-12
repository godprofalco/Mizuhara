const TicketSettings = require('../../models/TicketSettings');

module.exports = async (interaction) => {
  const settings = await TicketSettings.findOne({ guildId: interaction.guild.id });

  const isAdmin = settings.adminRoleIds.some(r => interaction.member.roles.cache.has(r));
  const isSupport = settings.supportRoleIds.some(r => interaction.member.roles.cache.has(r));

  return { isAdmin, isSupport };
};
