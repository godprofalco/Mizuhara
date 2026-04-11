const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  AttachmentBuilder,
} = require('discord.js');

const WorldWar = require('../../models/WorldWar');
const path = require('path');
const Canvas = require('@napi-rs/canvas');
const sharp = require('sharp');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('worldwar')
    .setDescription('Manage the WorldWar game')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('setup')
        .setDescription('Setup the WorldWar game')
        .addIntegerOption((option) =>
          option
            .setName('min_participants')
            .setDescription('Minimum participants')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('max_participants')
            .setDescription('Maximum participants')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('start').setDescription('Start the WorldWar game.')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('cancel')
        .setDescription('Cancel the active WorldWar game.')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('stop')
        .setDescription('Stop the current WorldWar game early.')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'setup') return setupGame(interaction);
    if (subcommand === 'start') return startGame(interaction);
    if (subcommand === 'cancel') return cancelGame(interaction);
    if (subcommand === 'stop') return stopGame(interaction);
  },
};

async function setupGame(interaction) {
  if (!interaction.member.permissions.has('ManageGuild')) {
    return interaction.reply({
      content: 'Missing permission: ManageServer',
      ephemeral: true,
    });
  }

  const min = interaction.options.getInteger('min_participants');
  const max = interaction.options.getInteger('max_participants');

  if (min < 2) return interaction.reply('Minimum must be at least 2.');
  if (max <= min) return interaction.reply('Max must be greater than min.');

  const count = await WorldWar.countDocuments();
  const warNumber = count + 1;

  const game = new WorldWar({
    warNumber,
    minParticipants: min,
    maxParticipants: max,
    participants: [],
    eliminated: [],
    status: 'active',
  });

  await game.save();

  const joinButton = new ButtonBuilder()
    .setCustomId(`worldwar-join-${warNumber}`)
    .setLabel('Join WorldWar')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(joinButton);

  const embed = new EmbedBuilder()
    .setTitle(`🌎 WorldWar #${warNumber}`)
    .setDescription(
      `Min: ${min}\nMax: ${max}\nClick to join!`
    )
    .setColor('#FF4444');

  await interaction.reply({ embeds: [embed], components: [row] });
}

async function startGame(interaction) {
  const game = await WorldWar.findOne({ status: 'active' });
  if (!game) return interaction.reply('No active game.');

  if (game.participants.length < game.minParticipants) {
    return interaction.reply('Not enough players.');
  }

  await interaction.reply('Starting WorldWar...');
  runGame(interaction.channel, game, interaction);
}

async function cancelGame(interaction) {
  const game = await WorldWar.findOne({ status: 'active' });
  if (!game) return interaction.reply('No game.');

  game.status = 'canceled';
  await game.save();

  interaction.reply('Game canceled.');
}

async function stopGame(interaction) {
  const game = await WorldWar.findOne({ status: 'active' });
  if (!game) return interaction.reply('No game.');

  game.status = 'completed';
  game.endedAt = Date.now();
  await game.save();

  interaction.reply('Game stopped.');
}

async function runGame(channel, game, interaction) {
  let participants = game.participants;
  let kills = {};
  let joinTimes = {};

  for (const p of participants) {
    kills[p] = 0;
    joinTimes[p] = Date.now();
  }

  while (participants.length > 1) {
    const killer = participants[Math.floor(Math.random() * participants.length)];
    const victim = participants[Math.floor(Math.random() * participants.length)];
    if (killer === victim) continue;

    kills[killer]++;

    participants = participants.filter((p) => p !== victim);
    game.eliminated.push(victim);
    await game.save();

    await announceElimination(channel, killer, victim, participants.length, interaction.guild);

    await new Promise((r) => setTimeout(r, 5000));
  }

  const winner = participants[0];

  game.winner = winner;
  game.status = 'completed';
  game.endedAt = Date.now();
  await game.save();

  const time = ((Date.now() - joinTimes[winner]) / 60000).toFixed(2);

  displayWinner(channel, winner, game.warNumber, interaction.guild, kills, time);
}

async function announceElimination(channel, killer, victim, remaining, guild) {
  const canvas = Canvas.createCanvas(1200, 600);
  const ctx = canvas.getContext('2d');

  const bg = await Canvas.loadImage(path.join(__dirname, '../../utils/worldwar-background.png'));
  ctx.drawImage(bg, 0, 0, 1200, 600);

  const killerAv = await fetch(guild.members.cache.get(killer).displayAvatarURL({ extension: 'png', size: 256 }));
  const killerBuf = await sharp(await killerAv.buffer()).png().toBuffer();
  const killerImg = await Canvas.loadImage(killerBuf);

  const victimAv = await fetch(guild.members.cache.get(victim).displayAvatarURL({ extension: 'png', size: 256 }));
  const victimBuf = await sharp(await victimAv.buffer()).png().toBuffer();
  const victimImg = await Canvas.loadImage(victimBuf);

  const y = (600 - 400) / 2;

  ctx.drawImage(killerImg, 100, y, 400, 400);
  ctx.drawImage(victimImg, 700, y, 400, 400);

  const sword = await Canvas.loadImage(path.join(__dirname, '../../utils/sword.png'));
  ctx.drawImage(sword, 400, 150, 400, 400);

  const attachment = new AttachmentBuilder(canvas.toBuffer(), {
    name: 'elimination.png',
  });

  await channel.send({ files: [attachment] });
}

async function displayWinner(channel, winner, warNumber, guild, kills, time) {
  const canvas = Canvas.createCanvas(600, 600);
  const ctx = canvas.getContext('2d');

  const bg = await Canvas.loadImage(path.join(__dirname, '../../utils/worldwar-background.png'));
  ctx.drawImage(bg, 0, 0, 600, 600);

  const avatar = await fetch(guild.members.cache.get(winner).displayAvatarURL({ extension: 'png', size: 256 }));
  const buf = await sharp(await avatar.buffer()).png().toBuffer();
  const img = await Canvas.loadImage(buf);

  ctx.drawImage(img, 172, 172, 256, 256);

  const crown = await Canvas.loadImage(path.join(__dirname, '../../utils/crown.png'));
  ctx.drawImage(crown, 200, 50, 200, 200);

  const attachment = new AttachmentBuilder(canvas.toBuffer(), {
    name: 'winner.png',
  });

  await channel.send({ files: [attachment] });
    }
