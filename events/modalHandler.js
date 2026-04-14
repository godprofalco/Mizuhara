const { Events, EmbedBuilder } = require('discord.js');

const OWNER_ID = "969181284784025670";

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {

    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'embed_builder') return;

    try {

      // ================= OWNER ONLY =================
      if (interaction.user.id !== OWNER_ID) {
        return interaction.reply({
          content: '❌ Only owner can use this.',
          ephemeral: true
        });
      }

      // ================= FIELD SAFE READ =================
      const channelId = interaction.fields.getTextInputValue('channel');
      const title = interaction.fields.getTextInputValue('title');
      const description = interaction.fields.getTextInputValue('description');
      const footer = interaction.fields.getTextInputValue('footer');
      const topImage = interaction.fields.getTextInputValue('top_image');

      // ================= VALID CHANNEL =================
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
        .setColor(0xFFA500) // 🟧 SAFE ORANGE
        .setTimestamp();

      if (title) embed.setTitle(title);
      if (description) embed.setDescription(description);
      if (footer) embed.setFooter({ text: footer });

      await channel.send({ embeds: [embed] });

      return interaction.reply({
        content: `✅ Embed sent successfully in <#${channel.id}>`,
        ephemeral: true
      });

    } catch (error) {
      console.error('Embed Error:', error);

      if (interaction.replied || interaction.deferred) return;

      return interaction.reply({
        content: '❌ Error creating embed',
        ephemeral: true
      }).catch(() => {});
    }
  },
};
