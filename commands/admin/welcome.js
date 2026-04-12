const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');

const Welcome = require('../../models/welcome');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('✨ Manage your welcome system')

    .addSubcommand(cmd =>
      cmd
        .setName('setup')
        .setDescription('🌸 Setup welcome system')
        .addChannelOption(opt =>
          opt
            .setName('channel')
            .setDescription('Welcome channel')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )

    .addSubcommand(cmd =>
      cmd
        .setName('edit')
        .setDescription('🎨 Edit welcome settings')
        .addStringOption(opt =>
          opt
            .setName('field')
            .setDescription('Field to edit')
            .setRequired(true)
            .addChoices(
              { name: 'Title', value: 'title' },
              { name: 'Description', value: 'description' },
              { name: 'Footer', value: 'footer' },
              { name: 'Thumbnail', value: 'thumbnail' },
              { name: 'Image Mode', value: 'imageMode' },
              { name: 'Image URL', value: 'imageURL' }
            )
        )
    ),

  async execute(interaction) {

    // FIXED PERMISSION CHECK
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ You need Administrator permission!',
        ephemeral: true,
      });
    }

    const { guild, user, options } = interaction;
    const sub = options.getSubcommand();

    let data = await Welcome.findOne({ serverId: guild.id });
    if (!data) data = await Welcome.create({ serverId: guild.id });

    // ================= SETUP =================
    if (sub === 'setup') {
      const setChannel = options.getChannel('channel');

      data.channelId = setChannel.id;
      await data.save();

      return interaction.reply({
        content: `🌸 Welcome channel set to ${setChannel}`,
        ephemeral: true,
      });
    }

    // ================= EDIT =================
    if (sub === 'edit') {
      const field = options.getString('field');

      await interaction.reply({
        content: `🎨 Send new value for **${field}** in THIS channel`,
        ephemeral: true,
      });

      const filter = m => m.author.id === user.id;

      const collector = interaction.channel.createMessageCollector({
        filter,
        time: 120000,
        max: 1,
      });

      collector.on('collect', async msg => {

        if (field === 'thumbnail') {
          data.thumbnail = msg.content.toLowerCase() === 'true';
        } else {
          data[field] = msg.content;
        }

        await data.save();

        msg.reply(`🌸✨ ${field} updated successfully!`);
      });
    }
  },
};
