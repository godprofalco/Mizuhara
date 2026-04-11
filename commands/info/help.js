const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ComponentType,
} = require('discord.js');

const Fuse = require('fuse.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all commands')
    .addStringOption(opt =>
      opt.setName('command')
        .setDescription('Get command info')
        .setAutocomplete(true)
    )
    .addStringOption(opt =>
      opt.setName('search')
        .setDescription('Search commands')
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    const cmds = [...interaction.client.commands.keys()];

    const filtered = cmds
      .filter(c => c.startsWith(focused))
      .slice(0, 10)
      .map(c => ({ name: c, value: c }));

    return interaction.respond(filtered);
  },

  async execute(interaction) {
    const { client } = interaction;

    const commandName = interaction.options.getString('command');
    const search = interaction.options.getString('search');

    const categoryMap = {
      admin: { name: 'Administration', emoji: '⚙️' },
      moderation: { name: 'Moderation', emoji: '🔨' },
      utility: { name: 'Utility', emoji: '🧰' },
      fun: { name: 'Fun', emoji: '🎉' },
      minecraft: { name: 'Minecraft', emoji: '🟩' },
      info: { name: 'Info', emoji: 'ℹ️' },
      music: { name: 'Music', emoji: '🎵' },
    };

    const baseEmbed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    // 🔎 SEARCH MODE
    if (search) {
      const fuse = new Fuse([...client.commands.values()], {
        keys: ['data.name', 'data.description'],
        threshold: 0.4,
      });

      const results = fuse.search(search);

      if (!results.length) {
        return interaction.reply({
          content: `❌ No results for "${search}"`,
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`Search: ${search}`)
        .setDescription(
          results.slice(0, 8).map((r, i) =>
            `**${i + 1}.** \`/${r.item.data.name}\` - ${r.item.data.description || 'No desc'}`
          ).join('\n')
        );

      return interaction.reply({ embeds: [embed] });
    }

    // 📌 SINGLE COMMAND VIEW
    if (commandName) {
      const cmd = client.commands.get(commandName);

      if (!cmd) {
        return interaction.reply({ content: 'Command not found', ephemeral: true });
      }

      baseEmbed
        .setTitle(`/${cmd.data.name}`)
        .setDescription(cmd.data.description || 'No description')
        .addFields({
          name: 'Usage',
          value: `\`/${cmd.data.name}\``
        });

      return interaction.reply({ embeds: [baseEmbed] });
    }

    // 📁 CATEGORY BUILD
    const categories = {};

    for (const cmd of client.commands.values()) {
      const raw = cmd.category || 'other';
      if (!categories[raw]) categories[raw] = [];
      categories[raw].push(cmd);
    }

    const categoryKeys = Object.keys(categories);

    const menu = new StringSelectMenuBuilder()
      .setCustomId('help_category')
      .setPlaceholder('Select category')
      .addOptions(
        categoryKeys.map(cat => {
          const meta = categoryMap[cat] || { name: cat, emoji: '📁' };

          return {
            label: meta.name,
            value: cat,
            description: `${categories[cat].length} commands`,
          };
        })
      );

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('Help Menu')
      .setDescription('Select a category below.')
      .setThumbnail(client.user.displayAvatarURL());

    const msg = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    });

    let selected = categoryKeys[0];
    let page = 0;
    const PAGE_SIZE = 6;

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000,
    });

    const update = async (i) => {
      const cmds = categories[selected];
      const pages = Math.ceil(cmds.length / PAGE_SIZE);

      const slice = cmds.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

      const pageEmbed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`📁 ${selected} (Page ${page + 1}/${pages})`)
        .setDescription(
          slice.map(c => `\`/${c.data.name}\` - ${c.data.description || 'No desc'}`).join('\n')
        );

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('Previous')
          .setStyle(2)
          .setDisabled(page === 0),

        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle(2)
          .setDisabled(page + 1 >= pages)
      );

      await i.update({
        embeds: [pageEmbed],
        components: [row, buttons],
      });
    };

    collector.on('collect', async (i) => {
      if (i.customId === 'help_category') {
        selected = i.values[0];
        page = 0;
        return update(i);
      }

      if (i.customId === 'next') {
        page++;
        return update(i);
      }

      if (i.customId === 'prev') {
        page--;
        return update(i);
      }
    });

    collector.on('end', async () => {
      row.components[0].setDisabled(true);
      await msg.edit({ components: [row] });
    });
  },
};
