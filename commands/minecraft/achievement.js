const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
} = require('discord.js');

const { createCanvas, loadImage } = require('canvas');
const path = require('path');

// ICON MAP (NEW ICONS INCLUDED)
const textures = {
  stone: "stone.png",
  diamond: "diamond.png",
  iron: "iron.png",
  gold: "gold.png",
  netherite: "netherite.png",
  mace: "mace.png",
  elytra: "elytra.png",
  end_crystal: "end_crystal.png",
  tnt: "tnt.png",
  chest: "chest.png",
  furnace: "furnace.png",
  crafting_table: "crafting_table.png",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievement')
    .setDescription('Generate a Minecraft-style achievement')
    .addStringOption(o =>
      o.setName('icon')
        .setDescription('Select icon')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption(o =>
      o.setName('head')
        .setDescription('Header')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('text')
        .setDescription('Description')
        .setRequired(true)
    ),

  async autocomplete(interaction) {
    const list = Object.keys(textures);
    const focused = interaction.options.getFocused().toLowerCase();

    const filtered = list
      .filter(x => x.includes(focused))
      .slice(0, 25);

    return interaction.respond(
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

    // ================= CANVAS (OLD MINECRAFT STYLE BOX) =================
    const canvas = createCanvas(420, 90);
    const ctx = canvas.getContext('2d');

    // dark background (old achievement style)
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // border (Minecraft style)
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // icon load (SAFE FIX)
    const file = textures[iconName] || "stone.png";
    const iconPath = path.join(__dirname, "../textures", file);

    let icon;
    try {
      icon = await loadImage(iconPath);
    } catch {
      icon = await loadImage(path.join(__dirname, "../textures/stone.png"));
    }

    // icon left side
    ctx.drawImage(icon, 12, 18, 54, 54);

    // TEXT (Minecraft-ish pixel feel fallback)
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px Arial";
    ctx.fillText("Achievement Get!", 80, 30);

    ctx.fillStyle = "#FFD700"; // yellow header
    ctx.font = "bold 15px Arial";
    ctx.fillText(head, 80, 52);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "14px Arial";
    ctx.fillText(text, 80, 72);

    const fileAttachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: "achievement.png",
    });

    // ================= OLD STYLE EMBED =================
    const url = "attachment://achievement.png";

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Download Achievement')
        .setStyle(ButtonStyle.Link)
        .setURL(url)
    );

    return interaction.reply({
      embeds: [
        {
          title: "🏆 Minecraft Achievement",
          description: "Custom achievement unlocked!",
          color: 0xffaa00,
          image: { url },
        },
      ],
      components: [row],
      files: [fileAttachment],
    });
  },
};
