const TicketSettings = require('../models/TicketSettings');

module.exports = async (guildId, member) => {
  const settings = await TicketSettings.findOne({ guildId });

  if (!settings) return false;

  return settings.supportRoleIds.some(roleId =>
    member.roles.cache.has(roleId)
  );
};
