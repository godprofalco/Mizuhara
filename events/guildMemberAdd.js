const { Events, EmbedBuilder } = require('discord.js');
const Welcome = require('../models/welcome');

async function getInviter(guild) {
  try {
    const invites = await guild.invites.fetch();
    const invite = invites.find(i => i.uses > 0);
    return invite?.inviter || null;
  } catch {
    return null;
  }
}

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(member) {
    const data = await Welcome.findOne({ serverId: member.guild.id });
    if (!data || !data.channelId) return;

    const channel = member.guild.channels.cache.get(data.channelId);
    if (!channel) return;

    const inviter = await getInviter(member.guild);

    let description = data.description;

    description = description
      .replace(/{member}/g, member.user.username)
      .replace(/{mention}/g, `<@${member.user.id}>`)
      .replace(/{server}/g, member.guild.name)
      .replace(/{userid}/g, member.user.id)
      .replace(/{membercount}/g, member.guild.memberCount)
      .replace(/{inviter}/g, inviter ? inviter.username : 'Unknown')
      .replace(/{invitermention}/g, inviter ? `<@${inviter.id}>` : 'Unknown');

    let image;

    if (data.imageMode === 'user') {
      image = member.user.displayAvatarURL({ size: 1024 });
    }
    if (data.imageMode === 'server') {
      image = member.guild.iconURL({ size: 1024 });
    }
    if (data.imageMode === 'banner') {
      image = member.guild.bannerURL({ size: 1024 });
    }
    if (data.imageMode === 'url') {
      image = data.imageURL;
    }

    const embed = new EmbedBuilder()
      .setTitle(data.title)
      .setDescription(description)
      .setFooter({ text: data.footer })
      .setColor('#00BFFF');

    if (data.thumbnail) {
      embed.setThumbnail(member.user.displayAvatarURL());
    }

    if (image) {
      embed.setImage(image);
    }

    channel.send({ embeds: [embed] });
  },
};
