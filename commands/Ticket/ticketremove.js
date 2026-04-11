module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketremove')
    .setDescription('Remove user from ticket')
    .addUserOption(o => o.setName('user').setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');

    await interaction.channel.permissionOverwrites.delete(user.id);

    interaction.reply(`${user} removed`);
  },
};
