require('dotenv').config();

const express = require('express');
const app = express();

// ================= EXPRESS (RENDER FIX) =================
app.get('/', (req, res) => {
  res.send('Everything is up!');
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ Express server running on port ${PORT}`);
});

// ================= DISCORD IMPORTS =================
const {
  Client,
  GatewayIntentBits,
  Collection,
} = require('discord.js');

const { LavalinkManager } = require('lavalink-client');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { autoPlayFunction } = require('./functions/autoPlay');

// ================= CLIENT =================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();

// ================= LAVALINK =================
client.lavalink = new LavalinkManager({
  nodes: [
    {
      authorization: process.env.LL_PASSWORD,
      host: process.env.LL_HOST,
      port: Number(process.env.LL_PORT),
      id: process.env.LL_NAME,
    },
  ],
  sendToShard: (guildId, payload) =>
    client.guilds.cache.get(guildId)?.shard?.send(payload),

  autoSkip: true,

  client: {
    id: process.env.DISCORD_CLIENT_ID,
    username: 'Mizuhara',
  },

  playerOptions: {
    onEmptyQueue: {
      destroyAfterMs: 30000,
      autoPlayFunction,
    },
  },
});

// ================= GLOBAL STYLES =================
global.styles = {
  successColor: chalk.bold.green,
  warningColor: chalk.bold.yellow,
  infoColor: chalk.bold.blue,
  commandColor: chalk.bold.cyan,
  errorColor: chalk.red,
  accentColor: chalk.bold.green,
  secondaryColor: chalk.bold.white,
};

// ================= HANDLERS =================
const handlerPath = path.join(__dirname, 'handlers');

if (fs.existsSync(handlerPath)) {
  const handlerFiles = fs.readdirSync(handlerPath).filter(f => f.endsWith('.js'));

  for (const file of handlerFiles) {
    const handler = require(`./handlers/${file}`);
    if (typeof handler === 'function') handler(client);
  }

  console.log(
    global.styles.successColor(`✅ Loaded ${handlerFiles.length} handlers`)
  );
}

// ================= COMMAND LOADER =================
const commandPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandPath)) {
  const commandFolders = fs.readdirSync(commandPath);

  for (const folder of commandFolders) {
    const folderPath = path.join(commandPath, folder);

    if (!fs.lstatSync(folderPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(path.join(folderPath, file));

      if (command?.data?.name) {
        client.commands.set(command.data.name, command);
      }
    }
  }

  console.log(
    global.styles.successColor(`✅ Loaded ${client.commands.size} commands`)
  );
}

// ================= SAFE INTERACTION HANDLER =================
client.on('interactionCreate', async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction, client);

  } catch (err) {
    console.error("❌ Interaction Error:", err);

    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Command execution failed.',
          ephemeral: true,
        });
      }
    } catch (e) {
      console.error("❌ Failed to send error reply:", e);
    }
  }
});

// ================= GLOBAL ERROR SAFETY =================
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

// ================= LOGIN =================
client.login(process.env.DISCORD_TOKEN);
