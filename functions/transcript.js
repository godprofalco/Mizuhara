module.exports = async (channel) => {
  const messages = await channel.messages.fetch({ limit: 100 });
  return messages.map(m => `${m.author.tag}: ${m.content}`).join('\n');
};
