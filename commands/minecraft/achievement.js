const {
  SlashCommandBuilder,
  AttachmentBuilder,
} = require('discord.js');

const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');

// 🎯 ICON LIST
const items = [
  "stone",
  "diamond",
  "iron",
  "gold",
  "netherite",
  "mace",
  "end_crystal",
  "elytra",
  "tnt",
  "chest",
  "furnace",
  "crafting_table",

  "creeper_head",
  "skeleton_skull",
  "wither_skeleton_skull",
  "zombie_head",
  "dragon_head",

  "blaze_rod",
  "blaze_powder",
  "ghast_tear",
  "ender_pearl",
  "nether_star"
];

// 🖼️ TEXTURE MAP
const textures = {
  stone: "stone.png",
  diamond: "diamond.png",
  iron: "iron.png",
  gold: "gold.png",
  netherite: "netherite.png",
  mace: "mace.png",
  end_crystal: "end_crystal.png",
  elytra: "elytra.png",
  tnt: "tnt.png",
  chest: "chest.png",
  furnace: "furnace.png",
  crafting_table: "crafting_table.png",

  creeper_head: "creeper_head.png",
  skeleton_skull: "skeleton_skull.png",
  wither_skeleton_skull: "wither_skeleton_skull.png",
  zombie_head: "zombie_head.png",
  dragon_head: "dragon_head.png",

  blaze_rod: "blaze_rod.png",
  blaze_powder: "blaze_powder.png",
  ghast_tear: "ghast_tear.png",
  ender_pearl: "ender_pearl.png",
  nether_star: "nether_star.png"
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievement')
    .setDescription('Minecraft Achievement Generator')
    .addStringOption(o =>
      o.setName('icon')
        .setDescription('Select icon')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption(o =>
      o.setName('head')
        .setDescription('Title')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('text')
        .setDescription('Description')
        .setRequired(true)
    ),

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

  async execute(interaction) {
    const iconName = interaction.options.getString('icon')?.toLowerCase();
    const head = interaction.options.getString('head');
    const text = interaction.options.getString('text');

    const canvas = createCanvas(420, 90);
    const ctx = canvas.getContext('2d');

    // background
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#555";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // safe icon resolve
    const file = textures?.[iconName] || "stone.png";
    const iconPath = path.resolve(__dirname, "../textures", file);

    let icon;
    try {
      icon = await loadImage(iconPath);
    } catch (err) {
      icon = await loadImage(path.resolve(__dirname, "../textures/stone.png"));
    }

    // draw icon
    ctx.drawImage(icon, 10, 15, 60, 60);

    // text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px Arial";
    ctx.fillText("Achievement Get!", 85, 30);

    ctx.font = "16px Arial";
    ctx.fillText(head, 85, 55);
    ctx.fillText(text, 85, 75);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: "achievement.png",
    });

    await interaction.reply({ files: [attachment] });
  },
};
