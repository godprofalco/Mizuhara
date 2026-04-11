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
    .setDescription('Create ticket panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(o =>
      o.setName('channel').setRequired(true)),

  async execute(interaction) {
    const panel = await TicketPanel.findOne({ guildId: interaction.guild.id });
    const channel = interaction.options.getChannel('channel');

    const embed = new EmbedBuilder()
      .setTitle(panel.title)
      .setDescription(panel.description)
      .setFooter({ text: panel.footer })
      .setColor('Blue');

    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticket_open')
      .setPlaceholder('Select ticket type')
      .addOptions(panel.dropdowns);

    await channel.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)],
    });

    interaction.reply({ content: 'Panel created!', ephemeral: true });
  },
};
