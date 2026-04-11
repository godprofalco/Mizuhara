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

    // ================= API BACKGROUND =================
    const apiUrl =
      `https://minecraftskinstealer.com/achievement/2/${encodeURIComponent(head)}/${encodeURIComponent(text)}`;

    let baseImage;
    try {
      baseImage = await loadImage(apiUrl);
    } catch {
      return interaction.editReply("❌ Failed to load achievement.");
    }

    // ================= ICON LOAD =================
    const iconFile = iconMap[icon] || "stone.png";
    const iconPath = path.join(process.cwd(), "textures", iconFile);

    if (!fs.existsSync(iconPath)) {
      return interaction.editReply("❌ Icon file missing.");
    }

    const iconImage = await loadImage(iconPath);

    // ================= CANVAS =================
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0);

    // ================= FORCE BLANK SLOT (ERASE API ICON) =================
    const slotX = 6;
    const slotY = 6;
    const slotSize = 60;

    ctx.fillStyle = "#c6c6c6"; // Minecraft UI grey
    ctx.fillRect(slotX, slotY, slotSize, slotSize);

    ctx.strokeStyle = "#3a3a3a";
    ctx.strokeRect(slotX, slotY, slotSize, slotSize);

    // ================= ICON (RESTORED ORIGINAL SIZE) =================
    const iconSize = 44; // original Minecraft feel (not too small)

    const iconX = slotX + (slotSize - iconSize) / 2;
    const iconY = slotY + (slotSize - iconSize) / 2;

    ctx.drawImage(iconImage, iconX, iconY, iconSize, iconSize);

    // ================= TEXT SHIFT RIGHT (NO COLLISION) =================
    const textStartX = 80;

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(head, textStartX, 26);

    ctx.fillStyle = "#dddddd";
    ctx.font = "12px sans-serif";
    ctx.fillText(text, textStartX, 46);

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
