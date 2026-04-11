const {
  SlashCommandBuilder,
  AttachmentBuilder,
} = require('discord.js');

const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');

// ICON LIST
const items = [
  "stone",
  "diamond",
  "iron",
  "gold",
  "netherite",
  "mace",
  "elytra",
  "tnt",
  "chest",
  "furnace",
  "crafting_table",
  "creeper_head",
  "dragon_head",
  "nether_star",
];

// TEXTURE MAP
const textures = {
  stone: "stone.png",
  diamond: "diamond.png",
  iron: "iron.png",
  gold: "gold.png",
  netherite: "netherite.png",
  mace: "mace.png",
  elytra: "elytra.png",
  tnt: "tnt.png",
  chest: "chest.png",
  furnace: "furnace.png",
  crafting_table: "crafting_table.png",
  creeper_head: "creeper_head.png",
  dragon_head: "dragon_head.png",
  nether_star: "nether_star.png",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievement')
    .setDescription('Minecraft Achievement (Canvas)')
    .addStringOption(o =>
      o.setName('icon')
        .setDescription('Icon')
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
    const value = interaction.options.getFocused().toLowerCase();

    const filtered = items
      .filter(i => i.includes(value))
      .slice(0, 25);

    await interaction.respond(
      filtered.map(i => ({
        name: i.replace(/_/g, ' '),
        value: i
      }))
    );
  },

  async execute(interaction) {
    const iconName = interaction.options.getString('icon');
    const head = interaction.options.getString('head');
    const text = interaction.options.getString('text');

    const canvas = createCanvas(420, 90);
    const ctx = canvas.getContext('2d');

    // BACKGROUND (Minecraft style)
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // BORDER (old achievement style)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // ICON PATH FIX (IMPORTANT)
    const file = textures[iconName] || "stone.png";
    const iconPath = path.join(process.cwd(), 'assets/textures', file);

    let icon;
    try {
      if (fs.existsSync(iconPath)) {
        icon = await loadImage(iconPath);
      } else {
        icon = await loadImage(path.join(process.cwd(), 'assets/textures/stone.png'));
      }
    } catch {
      icon = await loadImage(path.join(process.cwd(), 'assets/textures/stone.png'));
    }

    // ICON DRAW (LEFT SIDE)
    ctx.drawImage(icon, 10, 15, 60, 60);

    // TEXT STYLE (Minecraft-like)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Achievement Get!', 85, 28);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 15px Arial';
    ctx.fillText(head, 85, 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.fillText(text, 85, 72);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: 'achievement.png',
    });

    await interaction.reply({
      content: '🏆 Minecraft Achievement',
      files: [attachment],
    });
  },
};
