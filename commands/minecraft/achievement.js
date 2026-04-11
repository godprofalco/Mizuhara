const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

// ICON MAP (your new system)
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
    .setDescription('Minecraft Achievement (Canvas Style)')
    .addStringOption(o =>
      o.setName('icon')
        .setDescription('Icon')
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
    const iconName = interaction.options.getString('icon')?.toLowerCase();
    const head = interaction.options.getString('head');
    const text = interaction.options.getString('text');

    // ===== CANVAS =====
    const canvas = createCanvas(420, 90);
    const ctx = canvas.getContext('2d');

    // Minecraft-style dark background
    ctx.fillStyle = '#1f1f1f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Minecraft border (old achievement feel)
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

    // left icon background panel (classic look)
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(5, 10, 70, 70);

    // icon load
    const file = textures[iconName] || "stone.png";
    const iconPath = path.resolve(__dirname, "../textures", file);

    let icon;
    try {
      icon = await loadImage(iconPath);
    } catch {
      icon = await loadImage(path.resolve(__dirname, "../textures/stone.png"));
    }

    // draw icon (left side like old MC achievement)
    ctx.drawImage(icon, 12, 17, 56, 56);

    // ===== TEXT (Minecraft-style feel) =====
    ctx.fillStyle = '#ffd700'; // yellow header
    ctx.font = 'bold 16px Arial';
    ctx.fillText(head, 90, 35);

    ctx.fillStyle = '#ffffff'; // white description
    ctx.font = '14px Arial';
    ctx.fillText(text, 90, 65);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: 'achievement.png',
    });

    // ===== EMBED (your requested style) =====
    const embed = new EmbedBuilder()
      .setTitle('🏆 Minecraft Achievement')
      .setDescription('Custom achievement unlocked!')
      .setColor(0xffaa00)
      .setImage('attachment://achievement.png');

    await interaction.reply({
      embeds: [embed],
      files: [attachment],
    });
  },
};
