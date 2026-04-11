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
      return interaction.editReply("❌ API failed.");
    }

    // ================= ICON =================
    const iconPath = path.join(process.cwd(), "textures", iconMap[icon] || "stone.png");

    if (!fs.existsSync(iconPath)) {
      return interaction.editReply("❌ Icon missing.");
    }

    const iconImage = await loadImage(iconPath);

    // ================= CANVAS =================
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    // 🔥 STEP 1: draw API (text + UI stays)
    ctx.drawImage(baseImage, 0, 0);

    // 🔥 STEP 2: FORCE HIDE default icon
    const slotX = 6;
    const slotY = 6;
    const slotSize = 60;

    ctx.fillStyle = "#7a7a7a";
    ctx.fillRect(slotX, slotY, slotSize, slotSize);

    ctx.fillStyle = "#9c9c9c";
    ctx.fillRect(slotX + 2, slotY + 2, slotSize - 4, slotSize - 4);

    ctx.strokeStyle = "#2b2b2b";
    ctx.strokeRect(slotX, slotY, slotSize, slotSize);

    // 🔥 STEP 3: paste YOUR icon
    const iconSize = 34;

    const iconX = slotX + (slotSize - iconSize) / 2;
    const iconY = slotY + (slotSize - iconSize) / 2;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(iconImage, iconX, iconY, iconSize, iconSize);

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
        .setLabel("Download")
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
