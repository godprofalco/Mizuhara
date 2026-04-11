const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
} = require('discord.js');
const Fuse = require('fuse.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('🌟 View all commands or get detailed help')

    .addStringOption((option) =>
      option
        .setName('command')
        .setDescription('🔍 Get info about a command')
        .setAutocomplete(true)
    )

    .addStringOption((option) =>
      option
        .setName('search')
        .setDescription('⚡ Search commands')
    ),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().trim();
    const commandNames = [...interaction.client.commands.keys()];

    const filtered = commandNames
      .filter((name) => name.startsWith(focusedValue))
      .slice(0, 10)
      .map((name) => ({ name, value: name }));

    await interaction.respond(filtered);
  },

  async execute(interaction) {
    const { client } = interaction;
    const commandName = interaction.options.getString('command');
    const searchQuery = interaction.options.getString('search');

    const categoryMap = {
      admin: { name: 'Administration', emoji: '⚙️' },
      fun: { name: 'Fun & Games', emoji: '🎉' },
      level: { name: 'Leaderboard', emoji: '🎮' },
      music: { name: 'Music', emoji: '🎵' },
      moderation: { name: 'Moderation', emoji: '🔨' },
      utility: { name: 'Utility', emoji: '🪛' },
      minecraft: { name: 'Minecraft', emoji: '🟩' },
      info: { name: 'Information', emoji: 'ℹ️' },
      tickets: { name: 'Tickets', emoji: '🎫' },
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
        .setTitle(`🔎 Search Results`)
        .setDescription(
          results
            .slice(0, 10)
            .map(
              (r, i) =>
                `**${i + 1}.** \`/${r.item.data.name}\`\n🌸 ${r.item.data.description || 'No description'}`
            )
            .join('\n\n')
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
        .setDescription(`🌸 ${command.data.description || 'No description'}`)

        .addFields({
          name: '⚡ Usage',
          value:
            `\`/${command.data.name}\`` +
            (command.data.options?.length
              ? ' ' +
                command.data.options.map((opt) => `<${opt.name}>`).join(' ')
              : ''),
        });

      if (command.data.options?.length) {
        embed.addFields({
          name: '🧩 Options',
          value: command.data.options
            .map(
              (opt) =>
                `• \`${opt.name}\` → ${opt.description || 'No description'}`
            )
            .join('\n'),
        });
      }

      return interaction.reply({ embeds: [embed] });
    }

    // ================= MAIN MENU =================
    const categories = {};

    client.commands.forEach((cmd) => {
      const rawCategory = cmd.category || 'other';

      const display = categoryMap[rawCategory] || {
        name: rawCategory,
        emoji: '📁',
      };

      const key = `${display.emoji} ${display.name}`;

      if (!categories[key]) categories[key] = [];
      categories[key].push(cmd.data.name);
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help-menu')
      .setPlaceholder('🌟 Select a category')
      .addOptions(
        Object.keys(categories).map((category) => ({
          label: category,
          value: category,
          description: `View ${category} commands`,
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
        Object.entries(categories).map(([cat, cmds]) => ({
          name: `${cat}`,
          value: `🌟 ${cmds.length} commands`,
          inline: true,
        }))
      );

    await interaction.reply({ embeds: [mainEmbed], components: [row] });

    const filter = (i) =>
      (i.customId === 'help-menu' ||
        i.customId === 'prev' ||
        i.customId === 'next') &&
      i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    let page = 0;
    let selectedCategory = Object.keys(categories)[0];
    const PAGE_SIZE = 6;

    async function update(i, category, pageNum) {
      const cmds = categories[category];
      const totalPages = Math.ceil(cmds.length / PAGE_SIZE);

      const current = cmds.slice(
        pageNum * PAGE_SIZE,
        (pageNum + 1) * PAGE_SIZE
      );

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`🖼️ ${category}`)
        .setDescription(
          current
            .map((c) => {
              const cmd = client.commands.get(c);
              return `> 🌸 \`/${c}\`\n⚡ ${cmd?.data?.description || 'No description'}`;
            })
            .join('\n\n')
        )
        .setFooter({
          text: `📄 Page ${pageNum + 1}/${totalPages}`,
        });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('⬅️')
          .setStyle('Secondary')
          .setDisabled(pageNum === 0),

        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('➡️')
          .setStyle('Secondary')
          .setDisabled(pageNum + 1 >= totalPages)
      );

      await i.update({ embeds: [embed], components: [row, buttons] });
    }

    collector.on('collect', async (i) => {
      if (i.customId === 'help-menu') {
        selectedCategory = i.values[0];
        page = 0;
        await update(i, selectedCategory, page);
      }

      if (i.customId === 'prev') {
        page--;
        await update(i, selectedCategory, page);
      }

      if (i.customId === 'next') {
        page++;
        await update(i, selectedCategory, page);
      }
    });

    collector.on('end', async () => {
      const disabled = selectMenu.setDisabled(true);
      await interaction.editReply({
        components: [new ActionRowBuilder().addComponents(disabled)],
      });
    });
  },
};
