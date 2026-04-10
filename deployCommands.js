const { REST, Routes } = require('discord.js');
const fs = require('fs');

module.exports = async () => {
  const commands = [];

  const folders = fs.readdirSync('./commands');

  for (const folder of folders) {
    const files = fs
      .readdirSync(`./commands/${folder}`)
      .filter(file => file.endsWith('.js'));

    for (const file of files) {
      const cmd = require(`./commands/${folder}/${file}`);
      if (cmd.data) commands.push(cmd.data.toJSON());
    }
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.DISCORD_CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );

  console.log('✅ Slash commands updated (hideip FIXED)');
};
