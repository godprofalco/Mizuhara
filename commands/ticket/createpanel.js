const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionFlagsBits,
} = require('discord.js');

const TicketPanel = require('../../models/TicketPanel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createpanel')
    .setDescription('Send ticket panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('Channel').setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    const panel = await TicketPanel.findOne({ guildId: interaction.guild.id });

    if (!panel || panel.categories.length === 0) {
      return interaction.reply({
        content: '❌ No categories found in setup',
        ephemeral: true,
      });
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticket_open_menu')
      .setPlaceholder('🍁 Select Ticket Category')
      .addOptions(
        panel.categories.map(c => ({
          label: c.name,
          value: c.name,
          emoji: c.emoji,
          description: c.description,
        }))
      );

    const embed = new EmbedBuilder()
      .setTitle(panel.title)
      .setDescription(panel.description)
      .setFooter({ text: panel.footer })
      .setColor('Gold');

    await channel.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)],
    });

    return interaction.reply({
      content: '✅ Panel sent',
      ephemeral: true,
    });
  },
};
