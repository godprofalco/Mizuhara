const { Events } = require('discord.js');
const startGiveawayScheduler = require('../../functions/giveawayScheduler');
const serverStatusUpdater = require('../../functions/serverStatusUpdater');
const updateStatus = require('../../functions/statusRotation');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    startGiveawayScheduler(client);
    serverStatusUpdater(client);
    updateStatus(client);

    client.lavalink.init({ id: client.user.id });
    client.on('raw', (packet) => client.lavalink.sendRawData(packet));

    const commandFolderPath = path.join(__dirname, '../../commands');

    const categories = fs
      .readdirSync(commandFolderPath)
      .filter((file) =>
        fs.statSync(path.join(commandFolderPath, file)).isDirectory()
      );

    // ✅ SAFE STYLE FALLBACKS
    const style = (fn, fallback = (x) => x) =>
      typeof fn === 'function' ? fn : fallback;

    let categoryText = `${style(global.styles.accentColor)('📂 Categories:')}\n`;

    categories.forEach((category) => {
      categoryText += `    ${style(global.styles.primaryColor)('🔸')} ${style(global.styles.commandColor)(category)}\n`;
    });

    const startTime = new Date().toLocaleString();
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const serverCount = client.guilds.cache.size;

    const userCount = client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0
    );

    const divider = style(global.styles.dividerColor)(
      '═══════════════════════════════════════════════════════════════'
    );

    console.log(`\n${divider}`);

    console.log(
      `${style(global.styles.infoColor)('🤖 Bot User       :')} ${style(global.styles.userColor)(client.user.tag)}`
    );
    console.log(
      `${style(global.styles.infoColor)('🌍 Servers        :')} ${style(global.styles.accentColor)(serverCount)}`
    );
    console.log(
      `${style(global.styles.infoColor)('👥 Total Users    :')} ${style(global.styles.successColor)(userCount)}`
    );
    console.log(
      `${style(global.styles.infoColor)('📡 Status         :')} ${style(global.styles.successColor)('Online 🟢')}`
    );
    console.log(
      `${style(global.styles.infoColor)('⏰ Started At     :')} ${style(global.styles.secondaryColor)(startTime)}`
    );
    console.log(
      `${style(global.styles.infoColor)('📦 Version        :')} ${style(global.styles.secondaryColor)('v1.0.0')}`
    );
    console.log(
      `${style(global.styles.infoColor)('🔧 Node.js        :')} ${style(global.styles.highlightColor)(process.version)}`
    );
    console.log(
      `${style(global.styles.infoColor)('💾 Memory Usage   :')} ${style(global.styles.errorColor)(`${memoryUsage} MB`)}\n`
    );

    console.log(`${divider}`);
    console.log(`${categoryText}`);
    console.log(`${divider}`);
    console.log(`${style(global.styles.successColor)('\n🚀 Bot is ready! 🚀')}`);
    console.log(`${divider}\n`);
  },
};
