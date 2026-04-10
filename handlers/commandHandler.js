const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  client.commands = new Map();

  const commandsPath = path.join(__dirname, '../commands');

  const categories = fs.readdirSync(commandsPath);

  let commandCount = 0;
  let categoryCount = categories.length;

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);

    if (!fs.lstatSync(categoryPath).isDirectory()) continue;

    const commandFiles = fs
      .readdirSync(categoryPath)
      .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      try {
        const command = require(path.join(categoryPath, file));

        // 🔥 VALIDATION (IMPORTANT FIX)
        if (!command || !command.data || !command.data.name) {
          console.warn(`⚠️ Invalid command file: ${file}`);
          continue;
        }

        client.commands.set(command.data.name, {
          ...command,
          category
        });

        commandCount++;

      } catch (err) {
        console.error(`❌ Failed to load command ${file}:`, err);
      }
    }
  }

  console.log(
    global.styles.successColor(
      `✅ Loaded ${commandCount} commands across ${categoryCount} categories.`
    )
  );
};
