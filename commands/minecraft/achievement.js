const {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const { createCanvas, loadImage } = require('canvas');

// ICON MAP (SAFE CDN)
const iconMap = {
  stone: "https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@1.20.4/assets/minecraft/textures/block/stone.png",
  diamond: "https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@1.20.4/assets/minecraft/textures/item/diamond.png",
  iron: "https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@1.20.4/assets/minecraft/textures/item/iron_ingot.png",
  gold: "https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@1.20.4/assets/minecraft/textures/item/gold_ingot.png",
  netherite: "https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@1.20.4/assets/minecraft/textures/item/netherite_ingot.png",
  mace: "https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@1.20.4/assets/minecraft/textures/item/mace.png",
  elytra: "https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@1.20.4/assets/minecraft/textures/item/elytra.png",
  tnt: "https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@1.20.4/assets/minecraft/textures/block/tnt.png",
  chest: "https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@1.20.4/assets/minecraft/textures/block/chest.png",
  furnace: "https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@1.20.4/assets/minecraft/textures/block/furnace_front.png"
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievement')
    .setDescription('Minecraft Achievement Generator')
    .addStringOption(o =>
      o.setName('icon')
        .setDescription('Choose icon')
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

  // ✅ AUTOCOMPLETE FIXED
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();

    const choices = Object.keys(iconMap)
      .filter(i => i.includes(focused))
      .slice(0, 25)
      .map(i => ({ name: i, value: i }));

    await interaction.respond(choices);
  },

  async execute(interaction) {
    // ✅ SAFE ACK (prevents 10062)
    await interaction.deferReply().catch(() => {});

    const icon = interaction.options.getString('icon');
    const head = interaction.options.getString('head');
    const text = interaction.options.getString('text');

    // ================= SAFE API =================
    let baseImage;
    try {
      const apiUrl =
        `https://minecraftskinstealer.com/achievement/2/${encodeURIComponent(head)}/${encodeURIComponent(text)}`;
      baseImage = await loadImage(apiUrl);
    } catch (err) {
      return interaction.editReply("❌ Minecraft API failed.");
    }

    // ================= ICON LOAD SAFE =================
    let iconImage;
    try {
      iconImage = await loadImage(iconMap[icon] || iconMap.stone);
    } catch (err) {
      return interaction.editReply("❌ Icon failed to load.");
    }

    // ================= CANVAS =================
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(baseImage, 0, 0);

    // icon placement (Minecraft style)
    ctx.drawImage(iconImage, 16, 16, 48, 48);

    const buffer = canvas.toBuffer('image/png');

    const attachment = new AttachmentBuilder(buffer, {
      name: 'achievement.png'
    });

    // ================= EMBED (OLD STYLE CLEAN) =================
    const embed = new EmbedBuilder()
      .setTitle('🏆 Minecraft Achievement')
      .setDescription('Custom achievement unlocked!')
      .setColor(0xffaa00)
      .setImage('attachment://achievement.png')
      .setFooter({ text: `${head}` });

    // ================= BUTTON =================
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Download')
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://minecraftskinstealer.com/achievement/2/${encodeURIComponent(head)}/${encodeURIComponent(text)}`
        )
    );

    // ================= FINAL SAFE SEND =================
    try {
      await interaction.editReply({
        embeds: [embed],
        components: [row],
        files: [attachment]
      });
    } catch (err) {
      console.log(err);
    }
  }
};
