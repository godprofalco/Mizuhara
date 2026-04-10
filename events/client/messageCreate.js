const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  once: false,

  async execute(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const client = message.client;

    // 🔥 Check mention
    const isMentioned = message.mentions.has(client.user);
    if (!isMentioned) return;

    try {
      let helpCommandId = 'unknown';

      // ⚠️ safer fetch (only if API ready)
      if (client.application?.commands) {
        const commands = await client.application.commands.fetch();
        const helpCommand = commands.find(cmd => cmd.name === 'help');
        if (helpCommand) helpCommandId = helpCommand.id;
      }

      const userMessage = message.content
        .replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '')
        .trim();

      const mentionEmbed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setDescription(
          `👋 Hey ${message.author}, I'm Mizuhara, I use \`/\` commands.\n\n` +
          `💡 You said: **${userMessage || "hello"}**\n\n` +
          `📌 Type </help:${helpCommandId}> to see commands.\n` +
          `⭐ Mention @godpro_falco for details.`
        )
        .setTimestamp();

      return message.reply({ embeds: [mentionEmbed] });

    } catch (error) {
      console.error('Mention handler error:', error);

      return message.reply({
        content: `👋 Hey ${message.author}, I'm online! Use /help.`
      });
    }
  },
};
