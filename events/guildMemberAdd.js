const { EmbedBuilder } = require('discord.js');
const Welcome = require('../models/welcome');

module.exports = {
  name: 'guildMemberAdd',

  async execute(member) {
    const data = await Welcome.findOne({ serverId: member.guild.id });

    if (!data || !data.enabled || !data.channelId) return;

    const channel = member.guild.channels.cache.get(data.channelId);
    if (!channel) return;

    const replace = (text) =>
      text
        .replace(/{user}/g, member.user.username)
        .replace(/{mention}/g, `<@${member.user.id}>`)
        .replace(/{tag}/g, member.user.tag)
        .replace(/{id}/g, member.user.id)
        .replace(/{server}/g, member.guild.name)
        .replace(/{membercount}/g, member.guild.memberCount)
        .replace(/{created}/g, `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`);

    if (data.type === 'text') {
      return channel.send({
        content: replace(data.description),
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(replace(data.title))
      .setDescription(replace(data.description))
      .setFooter({ text: replace(data.footer) })
      .setColor(data.color || '#00BFFF');

    channel.send({ embeds: [embed] });
  },
};
