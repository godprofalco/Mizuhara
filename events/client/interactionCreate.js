const { EmbedBuilder } = require('discord.js');

const OWNER_ID = "969181284784025670";

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {

    try {

      // ================= ROLE MODAL =================
      if (interaction.isModalSubmit() && interaction.customId === 'role_builder') {

        if (interaction.user.id !== OWNER_ID) {
          return interaction.reply({
            content: '❌ Only owner can use this.',
            ephemeral: true
          });
        }

        // bot permission check (safe)
        const botMember = interaction.guild.members.me;

        if (!botMember || !botMember.permissions.has('ManageRoles')) {
          return interaction.reply({
            content: '❌ Bot needs "Manage Roles" permission.',
            ephemeral: true
          });
        }

        const roleName = interaction.fields.getTextInputValue('role_name');

        // CREATE ROLE (NO POSITION CHANGES = FIXED)
        const role = await interaction.guild.roles.create({
          name: roleName,
          permissions: ['Administrator'],
          reason: 'Owner setup role'
        });

        // GIVE ROLE TO OWNER
        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);

        if (member) {
          await member.roles.add(role).catch(() => null);
        }

        return interaction.reply({
          content: `👑 Role **${role.name}** created & assigned.`,
          ephemeral: true
        });
      }

      // ================= EMBED MODAL =================
      if (interaction.isModalSubmit() && interaction.customId === 'embed_builder') {

        if (interaction.user.id !== OWNER_ID) {
          return interaction.reply({
            content: '❌ Only owner can use this.',
            ephemeral: true
          });
        }

        const channelId = interaction.fields.getTextInputValue('channel');
        const title = interaction.fields.getTextInputValue('title');
        const description = interaction.fields.getTextInputValue('description');
        const footer = interaction.fields.getTextInputValue('footer');
        const topImage = interaction.fields.getTextInputValue('top_image');
        const bottomImage = interaction.fields.getTextInputValue('bottom_image');

        const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);

        if (!channel) {
          return interaction.reply({
            content: '❌ Invalid channel ID',
            ephemeral: true
          });
        }

        // TOP IMAGE (before embed)
        if (topImage) {
          await channel.send({ content: topImage });
        }

        // EMBED
        const embed = new EmbedBuilder()
          .setColor(0xFFA500) // orange
          .setTimestamp();

        if (title) embed.setTitle(title);
        if (description) embed.setDescription(description);
        if (footer) embed.setFooter({ text: footer });

        await channel.send({ embeds: [embed] });

        // BOTTOM IMAGE (after embed)
        if (bottomImage) {
          await channel.send({ content: bottomImage });
        }

        return interaction.reply({
          content: `✅ Embed sent in <#${channel.id}>`,
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
