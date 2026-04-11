const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder
} = require('discord.js');

const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');

// ================= ICON MAP =================
const iconMap = {
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
        .setDescription('Achievement title')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('text')
        .setDescription('Achievement description')
        .setRequired(true)
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();

    const choices = Object.keys(iconMap)
      .filter(i => i.includes(focused))
      .slice(0, 25)
      .map(i => ({ name: i, value: i }));

    return interaction.respond(choices).catch(() => {});
  },

  async execute(interaction) {
    await interaction.deferReply().catch(() => {});

    const icon = interaction.options.getString('icon');
    const head = interaction.options.getString('head');
    const text = interaction.options.getString('text');

    // ================= API =================
    const apiUrl =
      `https://minecraftskinstealer.com/achievement/2/${encodeURIComponent(head)}/${encodeURIComponent(text)}`;

    let baseImage;
    try {
      baseImage = await loadImage(apiUrl);
    } catch {
      return interaction.editReply("❌ Failed to load achievement API.");
    }

    // ================= ICON LOAD =================
    const iconPath = path.join(process.cwd(), "textures", iconMap[icon] || "stone.png");

    if (!fs.existsSync(iconPath)) {
      return interaction.editReply("❌ Icon missing in textures folder.");
    }

    const iconImage = await loadImage(iconPath);

    // ================= CANVAS (FIXED SIZE FOR STABILITY) =================
    const canvas = createCanvas(320, 64);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, 320, 64);

    // ================= HARD SLOT MASK (DESTROYS OLD ICON) =================
    const slot = { x: 6, y: 6, size: 60 };

    ctx.fillStyle = "#7a7a7a";
    ctx.fillRect(slot.x, slot.y, slot.size, slot.size);

    ctx.fillStyle = "#9c9c9c";
    ctx.fillRect(slot.x + 2, slot.y + 2, slot.size - 4, slot.size - 4);

    ctx.strokeStyle = "#2b2b2b";
    ctx.strokeRect(slot.x, slot.y, slot.size, slot.size);

    // ================= ICON (CENTER PERFECT) =================
    const iconSize = 34; // slightly better visual balance

    const iconX = slot.x + (slot.size - iconSize) / 2;
    const iconY = slot.y + (slot.size - iconSize) / 2;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(iconImage, iconX, iconY, iconSize, iconSize);

    // ================= SAFE TEXT AREA =================
    const textX = 80;
    const textMaxWidth = 220;

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(head, textX, 26);

    ctx.fillStyle = "#dddddd";
    ctx.font = "12px sans-serif";

    // simple wrap protection
    const shortText =
      text.length > 40 ? text.slice(0, 40) + "..." : text;

    ctx.fillText(shortText, textX, 46);

    // ================= OUTPUT =================
    const buffer = canvas.toBuffer("image/png");

    const attachment = new AttachmentBuilder(buffer, {
      name: "achievement.png"
    });

    const embed = new EmbedBuilder()
      .setTitle("🏆 Minecraft Achievement")
      .setImage("attachment://achievement.png")
      .setColor(0xffaa00);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Download Achievement")
        .setStyle(ButtonStyle.Link)
        .setURL(apiUrl)
    );

    return interaction.editReply({
      embeds: [embed],
      components: [row],
      files: [attachment]
    });
  }
};
