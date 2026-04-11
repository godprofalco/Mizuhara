const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');

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
    .setDescription('Minecraft Achievement')
    .addStringOption(o =>
      o.setName('icon').setDescription('Icon').setRequired(true))
    .addStringOption(o =>
      o.setName('head').setDescription('Title').setRequired(true))
    .addStringOption(o =>
      o.setName('text').setDescription('Description').setRequired(true)),

  async execute(interaction) {

    // FIX: prevents Discord timeout crash
    await interaction.deferReply();

    const iconName = interaction.options.getString('icon')?.toLowerCase();
    const head = interaction.options.getString('head');
    const text = interaction.options.getString('text');

    const canvas = createCanvas(420, 90);
    const ctx = canvas.getContext('2d');

    // BACKGROUND (Minecraft style)
    ctx.fillStyle = "#1c1c1c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // BORDER (old achievement look)
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

    // ICON BOX
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(6, 12, 66, 66);

    // FIXED PATH (Render safe)
    const file = textures[iconName] || "stone.png";
    const iconPath = path.join(process.cwd(), "textures", file);
    const fallbackPath = path.join(process.cwd(), "textures", "stone.png");

    let icon;
    try {
      icon = await loadImage(iconPath);
    } catch {
      icon = await loadImage(fallbackPath);
    }

    // ICON DRAW (left side)
    ctx.drawImage(icon, 12, 18, 54, 54);

    // TEXT STYLE (Minecraft feel)
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 15px Arial";
    ctx.fillText(head, 90, 35);

    ctx.fillStyle = "#ffffff";
    ctx.font = "13px Arial";
    ctx.fillText(text, 90, 62);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: "achievement.png"
    });

    const embed = new EmbedBuilder()
      .setTitle("🏆 Minecraft Achievement")
      .setDescription("Custom achievement unlocked!")
      .setColor(0xffaa00)
      .setImage("attachment://achievement.png");

    await interaction.editReply({
      embeds: [embed],
      files: [attachment]
    });
  }
};
