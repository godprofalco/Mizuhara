const Ticket = require('../models/Ticket');

module.exports = async (channel, user, reason = 'No reason provided') => {
  const ticket = await Ticket.findOne({ channelId: channel.id });

  if (!ticket) return;

  ticket.status = 'closed';
  await ticket.save();

  await channel.send(`❄️ Ticket closing by ${user.tag}\nReason: ${reason}`);

  setTimeout(() => {
    channel.delete().catch(() => {});
  }, 3000);
};
