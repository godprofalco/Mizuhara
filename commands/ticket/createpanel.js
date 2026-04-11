const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const TicketCategory = require('../../models/TicketCategory');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createpanel')
    .setDescription('Create ticket panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('Panel channel').setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    const categories = await TicketCategory.find({
      guildId: interaction.guild.id,
    });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticket_open_menu')
      .setPlaceholder('🍁 Select Ticket Type')
      .addOptions(
        categories.map(c => ({
          label: c.name,
          value: c.name,
          emoji: c.emoji,
          description: c.description,
        }))
      );

    const embed = new EmbedBuilder()
      .setTitle('🌟 Ticket System')
      .setDescription('Select a category to open a ticket')
      .setColor('#FFD700');

    await channel.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)],
    });

    return interaction.reply({
      content: '✅ Ticket panel created',
      ephemeral: true,
    });
  },
};
