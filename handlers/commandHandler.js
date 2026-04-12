const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const commandsPath = path.join(__dirname, '../commands');

  client.commands = new Map();

  if (!fs.existsSync(commandsPath)) {
    console.error('❌ Commands folder not found!');
    return;
  }

  const categories = fs.readdirSync(commandsPath);

  let commandCount = 0;
  let errorCount = 0;

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);

    // skip non-folders
    if (!fs.lstatSync(categoryPath).isDirectory()) continue;

    const commandFiles = fs
      .readdirSync(categoryPath)
      .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(categoryPath, file);

      try {
        const command = require(filePath);

        // validate command structure
        if (!command?.data?.name || typeof command.execute !== 'function') {
          console.warn(`⚠️ Invalid command skipped: ${file}`);
          continue;
        }

        // 💥 IMPORTANT FIX FOR HELP SYSTEM
        command.category = category;

        // register command
        client.commands.set(command.data.name, command);

        commandCount++;
        console.log(`✅ Loaded: ${command.data.name} [${category}]`);

      } catch (err) {
        errorCount++;
        console.error(`❌ Failed loading ${file}:`, err);
      }
    }
  }

  console.log(
    `\n✅ Commands Loaded: ${commandCount}` +
    `\n⚠️ Errors: ${errorCount}` +
    `\n📁 Categories: ${categories.length}\n`
  );
};
