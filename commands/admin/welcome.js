const {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
} = require('discord.js');

const Welcome = require('../../models/welcome');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Advanced welcome system')

    .addSubcommand(cmd =>
      cmd.setName('toggle').setDescription('Enable/disable system')
    )

    .addSubcommand(cmd =>
      cmd.setName('type')
        .setDescription('Set message type')
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription('embed or text')
            .setRequired(true)
            .addChoices(
              { name: 'Embed', value: 'embed' },
              { name: 'Text', value: 'text' }
            )
        )
    )

    .addSubcommand(cmd =>
      cmd.setName('setchannel')
        .setDescription('Set welcome channel')
        .addChannelOption(opt =>
          opt.setName('channel')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )

    .addSubcommand(cmd =>
      cmd.setName('set')
        .setDescription('Edit welcome message')
        .addStringOption(opt =>
          opt.setName('field')
            .setRequired(true)
            .addChoices(
              { name: 'title', value: 'title' },
              { name: 'description', value: 'description' },
              { name: 'footer', value: 'footer' },
              { name: 'color', value: 'color' }
            )
        )
        .addStringOption(opt =>
          opt.setName('value')
            .setRequired(true)
        )
    )

    .addSubcommand(cmd =>
      cmd.setName('test').setDescription('Preview message')
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'Admin only.', ephemeral: true });
    }

    const { options, guild, user } = interaction;
    const sub = options.getSubcommand();

    let data = await Welcome.findOne({ serverId: guild.id });

    if (!data) {
      data = await Welcome.create({ serverId: guild.id });
    }

    // TOGGLE
    if (sub === 'toggle') {
      data.enabled = !data.enabled;
      await data.save();

      return interaction.reply(`Welcome system is now **${data.enabled ? 'ON' : 'OFF'}**`);
    }

    // TYPE
    if (sub === 'type') {
      const type = options.getString('type');
      data.type = type;
      await data.save();

      return interaction.reply(`Type set to **${type}**`);
    }

    // CHANNEL
    if (sub === 'setchannel') {
      const ch = options.getChannel('channel');
      data.channelId = ch.id;
      await data.save();

      return interaction.reply(`Channel set to ${ch}`);
    }

    // SET FIELD
    if (sub === 'set') {
      const field = options.getString('field');
      const value = options.getString('value');

      data[field] = value;
      await data.save();

      return interaction.reply(`Updated **${field}**`);
    }

    // TEST
    if (sub === 'test') {
      const replaced = (text) =>
        text
          ?.replace(/{user}/g, user.username)
          .replace(/{mention}/g, `<@${user.id}>`)
          .replace(/{tag}/g, user.tag)
          .replace(/{id}/g, user.id)
          .replace(/{server}/g, guild.name)
          .replace(/{membercount}/g, guild.memberCount)
          .replace(/{joindate}/g, `<t:${Math.floor(Date.now()/1000)}:F>`)
          .replace(/{created}/g, `<t:${Math.floor(user.createdTimestamp/1000)}:R>`)
          .replace(/{avatar}/g, user.displayAvatarURL());

      if (data.type === 'text') {
        return interaction.reply({
          content: replaced(data.description),
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(replaced(data.title))
        .setDescription(replaced(data.description))
        .setFooter({ text: replaced(data.footer) })
        .setColor(data.color || '#00BFFF');

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};
