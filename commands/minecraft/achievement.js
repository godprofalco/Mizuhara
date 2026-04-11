const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
} = require('discord.js');

const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');

// 🔥 ITEMS (autocomplete list)
const items = [
  "grass",
  "stone",
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
  "tnt",
  "redstone",
  "chest",
  "furnace",
  "crafting_table",
  "anvil",
  "book"
];

// 🔥 TEXTURE MAP (THIS FIXES MACE + CRYSTAL ISSUE)
const textures = {
  grass: "grass.png",
  stone: "stone.png",
  diamond: "diamond.png",
  iron_ingot: "iron.png",
  gold_ingot: "gold.png",
  netherite_ingot: "netherite.png",
  diamond_sword: "diamond_sword.png",
  netherite_sword: "netherite_sword.png",
  bow: "bow.png",
  crossbow: "crossbow.png",
  shield: "shield.png",
  elytra: "elytra.png",
  totem_of_undying: "totem.png",
  end_crystal: "end_crystal.png",
  dragon_egg: "dragon_egg.png",
  beacon: "beacon.png",
  trident: "trident.png",
  mace: "mace.png",
  apple: "apple.png",
  golden_apple: "golden_apple.png",
  tnt: "tnt.png",
  redstone: "redstone.png",
  chest: "chest.png",
  furnace: "furnace.png",
  crafting_table: "crafting_table.png",
  anvil: "anvil.png",
  book: "book.png"
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievement')
    .setDescription('Generate a Minecraft-style achievement')

    .addStringOption(option =>
      option
        .setName('icon')
        .setDescription('Choose item (mace, elytra, diamond, etc.)')
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
      .filter(i => i.includes(focused))
      .slice(0, 25);

    await interaction.respond(
      filtered.map(i => ({
        name: i.replace(/_/g, ' '),
        value: i
      }))
    );
  },

  // 🔥 MAIN RENDER (NO API)
  async execute(interaction) {
    const iconName = interaction.options.getString('icon').toLowerCase();
    const head = interaction.options.getString('head');
    const text = interaction.options.getString('text');

    const canvas = createCanvas(420, 90);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#555";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Load icon safely
    const file = textures[iconName] || "stone.png";
    const iconPath = path.join(__dirname, "../textures", file);

    let icon;
    try {
      icon = await loadImage(iconPath);
    } catch {
      icon = await loadImage(path.join(__dirname, "../textures/stone.png"));
    }

    // Draw icon
    ctx.drawImage(icon, 10, 15, 60, 60);

    // Text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px Arial";
    ctx.fillText("Achievement Get!", 85, 30);

    ctx.font = "16px Arial";
    ctx.fillText(head, 85, 55);
    ctx.fillText(text, 85, 75);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: "achievement.png",
    });

    await interaction.reply({
      files: [attachment],
    });
  },
};
