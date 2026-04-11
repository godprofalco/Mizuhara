const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const commandsPath = path.join(__dirname, '../commands');

  client.commands = new Map(); // ONLY HERE (no other file should redefine it)

  const categories = fs.readdirSync(commandsPath);

  let commandCount = 0;

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);

    if (!fs.lstatSync(categoryPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(categoryPath, file);

      try {
        const command = require(filePath);

        if (!command?.data?.name || typeof command.execute !== 'function') {
          console.warn(`⚠️ Invalid command: ${file}`);
          continue;
        }

        client.commands.set(command.data.name, command);
        commandCount++;

        console.log(`✅ Loaded: ${command.data.name}`);

      } catch (err) {
        console.error(`❌ Error loading ${file}:`, err);
      }
    }
  }

  console.log(
    `✅ Loaded ${commandCount} commands across ${categories.length} categories`
  );
};
