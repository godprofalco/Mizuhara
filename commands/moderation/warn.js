const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  time,
} = require('discord.js');
const { Types } = require('mongoose');

const warnings = require('../../models/warnings');

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setName('warn')
    .setDescription('Warn a user or remove a warn')

    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Warn a user')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('The user to warn')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('The reason for the warn')
            .setRequired(true)
            .setMaxLength(500)
        )
    )

    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove a warn from a user')
        .addStringOption((option) =>
          option
            .setName('warn_id')
            .setDescription('The id of the warn to remove')
            .setRequired(true)
            .setMinLength(24)
            .setMaxLength(24)
        )
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({
        content: 'You do not have `KickMembers` permission!',
        ephemeral: true,
      });
    }

    const sub = interaction.options.getSubcommand();

    // ================= ADD WARN =================
    if (sub === 'add') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');

      const warnData = new warnings({
        _id: new Types.ObjectId(),
        guildId: interaction.guild.id,
        userId: user.id,
        warnReason: reason,
        moderator: interaction.user.id,
        warnDate: new Date(),
      });

      await warnData.save().catch(console.error);

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('⚠️ Member Warned')
            .setDescription(`<@${user.id}> has been warned`)
            .addFields(
              { name: 'Reason', value: reason },
              { name: 'Moderator', value: `<@${interaction.user.id}>` }
            )
            .setTimestamp(),
        ],
      });

      // DM user safely
      try {
        await user.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(`⚠️ You were warned in ${interaction.guild.name}`)
              .addFields(
                { name: 'Reason', value: reason },
                { name: 'Moderator', value: `<@${interaction.user.id}>` }
              )
              .setColor(0xff0000)
              .setTimestamp(),
          ],
        });
      } catch {
        await interaction.followUp({
          content: '⚠️ Could not DM user.',
          ephemeral: true,
        });
      }
    }

    // ================= REMOVE WARN =================
    if (sub === 'remove') {
      const warnId = interaction.options.getString('warn_id');

      let data;
      try {
        data = await warnings.findOne({
          _id: warnId,
          guildId: interaction.guild.id,
        });
      } catch {
        return interaction.reply({
          content: '❌ Invalid warn ID format.',
          ephemeral: true,
        });
      }

      if (!data) {
        return interaction.reply({
          content: `❌ No warn found with ID: ${warnId}`,
          ephemeral: true,
        });
      }

      await warnings.deleteOne({
        _id: warnId,
        guildId: interaction.guild.id,
      });

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('✅ Warn Removed')
            .setDescription(`Removed warn ID: \`${warnId}\``)
            .setColor(0x57f287)
            .setTimestamp(),
        ],
      });
    }
  },
};
