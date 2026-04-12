const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');

const TicketPanel = require('../../models/TicketPanel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createpanel')
    .setDescription('Send ticket panel')
    .addChannelOption(o =>
      o.setName('channel').setRequired(true)
    ),

  async execute(interaction) {
    const panel = await TicketPanel.findOne({ guildId: interaction.guild.id });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticket_menu')
      .setPlaceholder('Select Ticket Type')
      .addOptions(
        panel.dropdowns.map(d => ({
          label: d.name,
          value: d.name,
          emoji: d.emoji,
          description: d.description,
        }))
      );

    const embed = new EmbedBuilder()
      .setTitle(panel.title)
      .setDescription(panel.description)
      .setFooter({ text: panel.footer });

    await interaction.options.getChannel('channel').send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)],
    });

    interaction.reply({ content: '✅ Panel sent', ephemeral: true });
  },
};
