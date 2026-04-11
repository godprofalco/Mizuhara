const {
  SlashCommandBuilder,
  AttachmentBuilder,
} = require('discord.js');

const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');

// ICONS
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
};

// optional fallback
const fallback = "stone.png";

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievement')
    .setDescription('Minecraft Achievement Generator')
    .addStringOption(o =>
      o.setName('icon')
        .setDescription('Icon name')
        .setRequired(true)
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

  async execute(interaction) {
    await interaction.deferReply();

    const iconName = interaction.options.getString('icon')?.toLowerCase();
    const head = interaction.options.getString('head');
    const text = interaction.options.getString('text');

    const fileName = textures[iconName] || fallback;

    // FIXED PATH (Render-safe)
    const iconPath = path.join(process.cwd(), "textures", fileName);

    // CHECK FILE EXISTS (prevents crash)
    if (!fs.existsSync(iconPath)) {
      return interaction.editReply({
        content: `❌ Missing texture: ${fileName}`
      });
    }

    let icon;
    try {
      icon = await loadImage(iconPath);
    } catch (err) {
      return interaction.editReply({
        content: "❌ Failed to load image"
      });
    }

    // CANVAS
    const canvas = createCanvas(420, 90);
    const ctx = canvas.getContext('2d');

    // background (Minecraft style)
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // border
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // icon
    ctx.drawImage(icon, 10, 15, 60, 60);

    // text styling (Minecraft-ish)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("Achievement Get!", 85, 30);

    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(head, 85, 55);

    ctx.fillStyle = "#ffffff";
    ctx.font = "14px sans-serif";
    ctx.fillText(text, 85, 75);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: "achievement.png",
    });

    return interaction.editReply({
      files: [attachment],
    });
  },
};
