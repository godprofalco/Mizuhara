require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const clientId = process.env.DISCORD_CLIENT_ID;
const token = process.env.DISCORD_TOKEN;

module.exports = async () => {
  const commands = [];

  const commandsPath = path.join(__dirname, '../commands');

  const categories = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);

    if (!fs.lstatSync(categoryPath).isDirectory()) continue;

    const commandFiles = fs
      .readdirSync(categoryPath)
      .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      try {
        const command = require(path.join(categoryPath, file));

        if (!command?.data?.toJSON) {
          console.warn(`⚠️ Skipping invalid command: ${file}`);
          continue;
        }

        commands.push(command.data.toJSON());

      } catch (err) {
        console.error(`❌ Failed loading command ${file}:`, err);
      }
    }
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log(
      global.styles.warningColor('🔄 Started refreshing application (/) commands.')
    );

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log(
      global.styles.commandColor('✅ Successfully reloaded application (/) commands.')
    );

  } catch (error) {
    console.error(global.styles.errorColor(error));
  }
};
