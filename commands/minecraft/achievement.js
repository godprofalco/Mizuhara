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
        .setDescription('Achievement title')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('text')
        .setDescription('Achievement description')
        .setRequired(true)
    ),

  // ================= AUTOCOMPLETE =================
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();

    const choices = Object.keys(iconMap)
      .filter(i => i.includes(focused))
      .slice(0, 25)
      .map(i => ({ name: i, value: i }));

    return interaction.respond(choices).catch(() => {});
  },

  // ================= MAIN =================
  async execute(interaction) {
    await interaction.deferReply().catch(() => {});

    const icon = interaction.options.getString('icon');
    const head = interaction.options.getString('head');
    const text = interaction.options.getString('text');

    // ================= API BACKGROUND =================
    const apiUrl =
      `https://minecraftskinstealer.com/achievement/2/${encodeURIComponent(head)}/${encodeURIComponent(text)}`;

    let baseImage;
    try {
      baseImage = await loadImage(apiUrl);
    } catch {
      return interaction.editReply("❌ Failed to load achievement background.");
    }

    // ================= LOCAL ICON =================
    const iconFile = iconMap[icon] || "stone.png";
    const iconPath = path.join(process.cwd(), "textures", iconFile);

    if (!fs.existsSync(iconPath)) {
      return interaction.editReply("❌ Icon file missing in textures folder.");
    }

    let iconImage;
    try {
      iconImage = await loadImage(iconPath);
    } catch {
      return interaction.editReply("❌ Failed to load icon image.");
    }

    // ================= CANVAS =================
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d", { alpha: true });

    // draw API image (background + text)
    ctx.drawImage(baseImage, 0, 0);

    // ================= MODERN CLEAN SLOT =================
    const slotX = 7;
    const slotY = 7;
    const slotSize = 26;

    const iconSize = 22; // 🔥 modern clean size

    ctx.save();
    ctx.beginPath();
    ctx.rect(slotX, slotY, slotSize, slotSize);
    ctx.clip();

    const iconX = slotX + Math.floor((slotSize - iconSize) / 2);
    const iconY = slotY + Math.floor((slotSize - iconSize) / 2) - 1;

    ctx.drawImage(iconImage, iconX, iconY, iconSize, iconSize);

    ctx.restore();

    // ================= OUTPUT =================
    const buffer = canvas.toBuffer("image/png");

    const attachment = new AttachmentBuilder(buffer, {
      name: "achievement.png"
    });

    // ================= EMBED =================
    const embed = new EmbedBuilder()
      .setTitle("🏆 Minecraft Achievement")
      .setDescription("Custom achievement unlocked!")
      .setColor(0xffaa00)
      .setImage("attachment://achievement.png");

    // ================= BUTTON =================
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
