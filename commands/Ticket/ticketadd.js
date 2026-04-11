module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketadd')
    .setDescription('Add user to ticket')
    .addUserOption(o => o.setName('user').setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');

    await interaction.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: true,
      SendMessages: true,
    });

    interaction.reply(`${user} added to ticket`);
  },
};
