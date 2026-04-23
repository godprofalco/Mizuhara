function isAuthorized(interaction) {
  const isOwner = interaction.guild.ownerId === interaction.user.id;
  const isBotOwner = interaction.user.id === process.env.BOT_OWNER_ID;
  const isAdmin = interaction.member.permissions.has("Administrator");

  return isOwner || isBotOwner || isAdmin;
}

module.exports = { isAuthorized };
