const {
  SlashCommandBuilder,
  ChannelType,
} = require('discord.js');

const Welcome = require('../../models/welcome');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('✨ Manage your welcome system')

    .addSubcommand(cmd =>
      cmd.setName('setup')
        .setDescription('🌸 Setup welcome system')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )

    .addSubcommand(cmd =>
      cmd.setName('edit')
        .setDescription('🎨 Edit welcome settings')
        .addStringOption(opt =>
          opt.setName('field')
            .setRequired(true)
            .addChoices(
              { name: '🍁 Title', value: 'title' },
              { name: '🌸 Description', value: 'description' },
              { name: '❄️ Footer', value: 'footer' },
              { name: '⚡ Thumbnail', value: 'thumbnail' },
              { name: '🖼️ Image Mode', value: 'imageMode' },
              { name: '🌟 Image URL', value: 'imageURL' }
            )
        )
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content: '❌ You need **Administrator** permission!',
        ephemeral: true
      });
    }

    const { guild, user, options, channel } = interaction;
    const sub = options.getSubcommand();

    let data = await Welcome.findOne({ serverId: guild.id });
    if (!data) data = await Welcome.create({ serverId: guild.id });

    // ================= SETUP =================
    if (sub === 'setup') {
      const setChannel = options.getChannel('channel');
      data.channelId = setChannel.id;
      await data.save();

      await interaction.reply({
        content:
          '🌸 **Welcome Setup Started!**\n\n' +
          'Reply step-by-step:\n\n' +
          '🍁 **1. Title**\n' +
          '🌸 **2. Description**\n' +
          '❄️ **3. Footer**\n' +
          '⚡ **4. Thumbnail** (true/false)\n' +
          '🖼️ **5. Image Mode** (user/server/banner/url)\n' +
          '🌟 **6. Image URL** (or `skip`)\n\n' +
          '⏳ 5 minutes time!',
        ephemeral: true,
      });

      const filter = m => m.author.id === user.id;

      const collector = channel.createMessageCollector({
        filter,
        time: 300000,
      });

      let step = 0;

      collector.on('collect', async msg => {
        step++;

        if (step === 1) data.title = msg.content;
        if (step === 2) data.description = msg.content;
        if (step === 3) data.footer = msg.content;
        if (step === 4) data.thumbnail = msg.content.toLowerCase() === 'true';
        if (step === 5) data.imageMode = msg.content.toLowerCase();
        if (step === 6 && msg.content !== 'skip') data.imageURL = msg.content;

        if (step >= 6) {
          await data.save();
          msg.reply('🌟✨ Welcome system configured successfully!');
          collector.stop();
        } else {
          msg.reply(`⚡ Step ${step} saved, continue...`);
        }
      });
    }

    // ================= EDIT =================
    if (sub === 'edit') {
      const field = options.getString('field');

      await interaction.reply({
        content: `🎨 Send new value for **${field}**`,
        ephemeral: true,
      });

      const filter = m => m.author.id === user.id;

      const collector = channel.createMessageCollector({
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
        msg.reply(`🌸✨ ${field} updated!`);
      });
    }
  },
};
