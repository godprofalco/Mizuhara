const Ticket = require('../../models/Ticket');

module.exports = async (interaction) => {
  const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
  if (!ticket) return;

  ticket.status = 'closed';
  ticket.closedAt = new Date();
  await ticket.save();

  await interaction.channel.send('❄️ Closing ticket...');
  setTimeout(() => interaction.channel.delete(), 3000);
};
