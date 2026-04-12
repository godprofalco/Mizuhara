const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const Fuse = require('fuse.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('🌟 View all commands or get detailed help')

    .addStringOption(option =>
      option
        .setName('command')
        .setDescription('🔍 Get info about a command')
        .setAutocomplete(true)
    )

    .addStringOption(option =>
      option
        .setName('search')
        .setDescription('⚡ Search commands')
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    const commands = [...interaction.client.commands.keys()];

    const filtered = commands
      .filter(cmd => cmd.toLowerCase().includes(focused))
      .slice(0, 10)
      .map(cmd => ({ name: cmd, value: cmd }));

    await interaction.respond(filtered);
  },

  async execute(interaction) {
    const { client } = interaction;

    const commandName = interaction.options.getString('command');
    const searchQuery = interaction.options.getString('search');

    const categoryMap = {
      admin: { name: 'Administration', emoji: '⚙️' },
      fun: { name: 'Fun & Games', emoji: '🎉' },
      level: { name: 'Level System', emoji: '🎮' },
      music: { name: 'Music', emoji: '🎵' },
      moderation: { name: 'Moderation', emoji: '🔨' },
      utility: { name: 'Utility', emoji: '🪛' },
      minecraft: { name: 'Minecraft', emoji: '🟩' },
      info: { name: 'Information', emoji: 'ℹ️' },
      ticket: { name: 'Tickets', emoji: '🎫' },
      other: { name: 'Other', emoji: '📁' },
    };

    const baseEmbed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setFooter({
        text: `🌸 Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    // ================= SEARCH =================
    if (searchQuery) {
      const fuse = new Fuse([...client.commands.values()], {
        keys: ['data.name', 'data.description'],
        threshold: 0.4,
      });

      const results = fuse.search(searchQuery);

      if (!results.length) {
        return interaction.reply({
          content: `❌ No commands found for "${searchQuery}"`,
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('🔎 Search Results')
        .setDescription(
          results.slice(0, 10).map((r, i) => {
            const cmd = r.item;
            return `**${i + 1}.** \`/${cmd.data.name}\`\n🌸 ${cmd.data.description || 'No description'}`;
          }).join('\n\n')
        )
        .setFooter({
          text: `🌟 Found ${results.length} results`,
        });

      return interaction.reply({ embeds: [embed] });
    }

    // ================= SINGLE COMMAND =================
    if (commandName) {
      const command = client.commands.get(commandName);

      if (!command) {
        return interaction.reply({
          content: '❌ Command not found!',
          ephemeral: true,
        });
      }

      const embed = baseEmbed
        .setTitle(`🌟 /${command.data.name}`)
        .setDescription(`🌸 ${command.data.description || 'No description'}`);

      return interaction.reply({ embeds: [embed] });
    }

    // ================= CATEGORY BUILD =================
    const categories = {};

    client.commands.forEach(cmd => {
      const raw = cmd.category || 'other';

      const display = categoryMap[raw] || {
        name: raw,
        emoji: '📁',
      };

      const key = `${display.emoji} ${display.name}`;

      if (!categories[key]) categories[key] = [];
      categories[key].push(cmd.data.name);
    });

    const categoryKeys = Object.keys(categories);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help-menu')
      .setPlaceholder('🌟 Select a category')
      .addOptions(
        categoryKeys.map(cat => ({
          label: cat,
          value: cat,
          description: `View ${cat} commands`,
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const mainEmbed = baseEmbed
      .setThumbnail(client.user.displayAvatarURL())
      .setTitle('🌸 Help Menu')
      .setDescription(
        '✨ Select a category below to explore commands.\n\n' +
        '🔍 Use `/help command:<name>` for details\n' +
        '⚡ Use `/help search:<word>` to search'
      )
      .addFields(
        categoryKeys.map(cat => ({
          name: cat,
          value: `🌟 ${categories[cat].length} commands`,
          inline: true,
        }))
      );

    await interaction.reply({
      embeds: [mainEmbed],
      components: [row],
    });

    // ================= PAGINATION =================
    const collector = interaction.channel.createMessageComponentCollector({
      filter: i =>
        (i.customId === 'help-menu' ||
          i.customId === 'prev' ||
          i.customId === 'next') &&
        i.user.id === interaction.user.id,
      time: 60000,
    });

    let selectedCategory = categoryKeys[0];
    let page = 0;
    const PAGE_SIZE = 6;

    const update = async (i, category, pageNum) => {
      const cmds = categories[category] || [];
      const totalPages = Math.max(1, Math.ceil(cmds.length / PAGE_SIZE));

      const slice = cmds.slice(
        pageNum * PAGE_SIZE,
        (pageNum + 1) * PAGE_SIZE
      );

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(category)
        .setDescription(
          slice.map(c => {
            const cmd = client.commands.get(c);
            return `> 🌸 \`/${c}\`\n⚡ ${cmd?.data?.description || 'No description'}`;
          }).join('\n\n')
        )
        .setFooter({
          text: `📄 Page ${pageNum + 1}/${totalPages}`,
        });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('⬅️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(pageNum === 0),

        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('➡️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(pageNum + 1 >= totalPages)
      );

      await i.update({
        embeds: [embed],
        components: [row, buttons],
      });
    };

    collector.on('collect', async i => {
      if (i.customId === 'help-menu') {
        selectedCategory = i.values[0];
        page = 0;
        return update(i, selectedCategory, page);
      }

      if (i.customId === 'prev') {
        page--;
        return update(i, selectedCategory, page);
      }

      if (i.customId === 'next') {
        page++;
        return update(i, selectedCategory, page);
      }
    });

    collector.on('end', async () => {
      const disabledMenu = new StringSelectMenuBuilder(selectMenu).setDisabled(true);

      await interaction.editReply({
        components: [new ActionRowBuilder().addComponents(disabledMenu)],
      });
    });
  },
};
