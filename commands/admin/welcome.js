const {
  SlashCommandBuilder,
  ChannelType,
} = require('discord.js');

const Welcome = require('../../models/welcome');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Welcome system setup')

    .addSubcommand(c =>
      c.setName('toggle')
        .setDescription('Enable/Disable welcome system')
    )

    .addSubcommand(c =>
      c.setName('setchannel')
        .setDescription('Set welcome channel')
        .addChannelOption(o =>
          o.setName('channel')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )

    .addSubcommand(c =>
      c.setName('type')
        .setDescription('Set message type')
        .addStringOption(o =>
          o.setName('type')
            .setRequired(true)
            .addChoices(
              { name: 'Embed', value: 'embed' },
              { name: 'Text', value: 'text' }
            )
        )
    )

    .addSubcommand(c =>
      c.setName('set')
        .setDescription('Edit message')
        .addStringOption(o =>
          o.setName('field')
            .setRequired(true)
            .addChoices(
              { name: 'title', value: 'title' },
              { name: 'description', value: 'description' },
              { name: 'footer', value: 'footer' },
              { name: 'color', value: 'color' }
            )
        )
        .addStringOption(o =>
          o.setName('value')
            .setRequired(true)
        )
    )

    .addSubcommand(c =>
      c.setName('test')
        .setDescription('Test welcome message')
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'Admin only.', ephemeral: true });
    }

    const { guild, options, user } = interaction;
    const sub = options.getSubcommand();

    let data = await Welcome.findOne({ serverId: guild.id });

    if (!data) {
      data = await Welcome.create({ serverId: guild.id });
    }

    // TOGGLE
    if (sub === 'toggle') {
      data.enabled = !data.enabled;
      await data.save();
      return interaction.reply(`Welcome system: **${data.enabled ? 'ON' : 'OFF'}**`);
    }

    // CHANNEL
    if (sub === 'setchannel') {
      const ch = options.getChannel('channel');
      data.channelId = ch.id;
      await data.save();
      return interaction.reply(`Channel set to ${ch}`);
    }

    // TYPE
    if (sub === 'type') {
      data.type = options.getString('type');
      await data.save();
      return interaction.reply(`Type set to **${data.type}**`);
    }

    // EDIT
    if (sub === 'set') {
      const field = options.getString('field');
      const value = options.getString('value');

      data[field] = value;
      await data.save();

      return interaction.reply(`Updated **${field}**`);
    }

    // TEST
    if (sub === 'test') {
      const replace = (text) =>
        text
          .replace(/{user}/g, user.username)
          .replace(/{mention}/g, `<@${user.id}>`)
          .replace(/{server}/g, guild.name)
          .replace(/{membercount}/g, guild.memberCount)
          .replace(/{created}/g, `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`);

      if (data.type === 'text') {
        return interaction.reply({
          content: replace(data.description),
          ephemeral: true,
        });
      }

      return interaction.reply({
        embeds: [{
          title: replace(data.title),
          description: replace(data.description),
          footer: { text: replace(data.footer) },
          color: parseInt(data.color.replace('#', ''), 16),
        }],
        ephemeral: true,
      });
    }
  },
};
