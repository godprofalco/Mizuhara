const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

// 🔥 ITEM LIST (you can expand anytime)
const items = [
  "grass",
  "stone",
  "cobblestone",
  "diamond",
  "iron_ingot",
  "gold_ingot",
  "netherite_ingot",
  "diamond_sword",
  "netherite_sword",
  "bow",
  "crossbow",
  "shield",
  "elytra",
  "totem_of_undying",
  "end_crystal",
  "dragon_egg",
  "beacon",
  "trident",
  "mace",
  "apple",
  "golden_apple",
  "enchanted_golden_apple",
  "tnt",
  "redstone",
  "hopper",
  "chest",
  "furnace",
  "crafting_table",
  "anvil",
  "book",
  "written_book"
];

// 🔥 SAFE ICON MAPPING (prevents API break)
const iconMap = {
  grass: 1,
  stone: 20,
  cobblestone: 20,
  diamond: 2,
  iron_ingot: 22,
  gold_ingot: 23,
  netherite_ingot: 742,
  diamond_sword: 3,
  netherite_sword: 743,
  bow: 34,
  crossbow: 358,
  shield: 442,
  elytra: 444,
  totem_of_undying: 449,
  end_crystal: 426,
  dragon_egg: 122,
  beacon: 138,
  trident: 650,
  apple: 260,
  golden_apple: 322,
  enchanted_golden_apple: 466,
  tnt: 46,
  redstone: 331,
  hopper: 154,
  chest: 54,
  furnace: 61,
  crafting_table: 58,
  anvil: 145,
  book: 340,
  written_book: 387,

  // ⚠️ NEW ITEM (MACE) — fallback safe icon
  mace: 3
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievement')
    .setDescription('Generate a Minecraft-style achievement')

    .addStringOption(option =>
      option
        .setName('icon')
        .setDescription('Choose item (diamond, elytra, mace, etc.)')
        .setRequired(true)
        .setAutocomplete(true)
    )

    .addStringOption(option =>
      option
        .setName('head')
        .setDescription('Achievement title')
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('text')
        .setDescription('Achievement description')
        .setRequired(true)
    ),

  // 🔥 AUTOCOMPLETE
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();

    const filtered = items
      .filter(item => item.includes(focused))
      .slice(0, 25);

    await interaction.respond(
      filtered.map(item => ({
        name: item.replace(/_/g, ' '),
        value: item
      }))
    );
  },

  // 🔥 EXECUTE
  async execute(interaction) {
    const head = interaction.options.getString('head');
    const text = interaction.options.getString('text');
    const iconName = interaction.options.getString('icon').toLowerCase();

    // 🔥 SAFE ICON RESOLVE
    const iconId = iconMap[iconName] ?? iconMap.diamond_sword;

    const url = `https://minecraftskinstealer.com/achievement/${encodeURIComponent(iconId)}/${encodeURIComponent(head)}/${encodeURIComponent(text)}`;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Download Achievement')
        .setStyle(ButtonStyle.Link)
        .setURL(url)
    );

    await interaction.reply({
      embeds: [
        {
          title: '🏆 Minecraft Achievement',
          description: 'Custom achievement unlocked!',
          image: { url },
          color: 0xffaa00,
        },
      ],
      components: [row],
    });
  },
};
