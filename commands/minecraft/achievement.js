const {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const { createCanvas, loadImage } = require('canvas');

// ICON MAP (NO FILES)
const iconMap = {
  stone: "https://minecraft.wiki/images/Stone_JE5_BE3.png",
  diamond: "https://minecraft.wiki/images/Diamond_JE3_BE3.png",
  iron: "https://minecraft.wiki/images/Iron_Ingot_JE3_BE2.png",
  gold: "https://minecraft.wiki/images/Gold_Ingot_JE3_BE2.png",
  netherite: "https://minecraft.wiki/images/Netherite_Ingot_JE1_BE1.png",
  mace: "https://minecraft.wiki/images/Mace_JE1_BE1.png",
  elytra: "https://minecraft.wiki/images/Elytra_JE1_BE1.png",
  tnt: "https://minecraft.wiki/images/TNT_JE3_BE2.png",
  chest: "https://minecraft.wiki/images/Chest_JE2_BE2.png",
  furnace: "https://minecraft.wiki/images/Furnace_JE3_BE2.png"
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievement')
    .setDescription('Minecraft Achievement')
    .addStringOption(o =>
      o.setName('icon')
        .setDescription('Item icon')
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
    const focused = interaction.options.getFocused().toLowerCase();

    const choices = Object.keys(iconMap)
      .filter(i => i.includes(focused))
      .slice(0, 25)
      .map(i => ({ name: i, value: i }));

    await interaction.respond(choices);
  },

  async execute(interaction) {
    await interaction.deferReply();

    const icon = interaction.options.getString('icon');
    const head = interaction.options.getString('head');
    const text = interaction.options.getString('text');

    const apiUrl =
      `https://minecraftskinstealer.com/achievement/2/${encodeURIComponent(head)}/${encodeURIComponent(text)}`;

    const baseImage = await loadImage(apiUrl);

    const iconUrl = iconMap[icon] || iconMap.stone;
    const iconImage = await loadImage(iconUrl);

    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(baseImage, 0, 0);
    ctx.drawImage(iconImage, 16, 16, 48, 48);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: 'achievement.png'
    });

    // ✅ FULL EMBED (CORRECTED)
    const embed = new EmbedBuilder()
      .setTitle('🏆 Minecraft Achievement')
      .setDescription('Custom achievement unlocked!')
      .setColor(0xffaa00)
      .setImage('attachment://achievement.png')
      .setFooter({ text: `${head}` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Download Achievement')
        .setStyle(ButtonStyle.Link)
        .setURL(apiUrl)
    );

    await interaction.editReply({
      embeds: [embed],
      components: [row],
      files: [attachment]
    });
  }
};
