const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');

const OWNER_ID = "969181284784025670";

module.exports = {
  data: new SlashCommandBuilder()
    .setName('solo')
    .setDescription('Create test channels (owner only)')
    
    .addChannelOption(option =>
      option.setName('category')
        .setDescription('Select a category')
        .setRequired(true)
    )

    .addStringOption(option =>
      option.setName('channel-name')
        .setDescription('Name of channels (same name will be repeated)')
        .setRequired(true)
    )

    .addIntegerOption(option =>
      option.setName('channel-count')
        .setDescription('Number of channels (1-3000 only)')
        .setRequired(true)
    ),

  async execute(interaction) {

    // 🔒 OWNER ONLY
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: "❌ Owner only command.",
        ephemeral: true,
      });
    }

    const category = interaction.options.getChannel('category');
    const baseName = interaction.options.getString('channel-name');
    const count = interaction.options.getInteger('channel-count');

    // ⚠️ safety limit
    if (count < 1 || count > 3000) {
      return interaction.reply({
        content: "❌ Please select a channel-count between **1 and 3000**.",
        ephemeral: true,
      });
    }

    // 🤖 bot permission check
    if (!interaction.guild.members.me.permissions.has(
      PermissionsBitField.Flags.ManageChannels
    )) {
      return interaction.reply({
        content: "❌ I need **Manage Channels** permission.",
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: `🧪 Creating **${count}** channels named **${baseName}** in **${category.name}**...`,
      ephemeral: true,
    });

    // ➕ CREATE SAME-NAME CHANNELS
    for (let i = 1; i <= count; i++) {
      await interaction.guild.channels.create({
        name: baseName, // 👈 SAME NAME EVERY TIME
        type: ChannelType.GuildText,
        parent: category.id,
        reason: "Owner test channel generator",
      });
    }

    await interaction.followUp({
      content: `✅ Successfully created ${count} channels named "${baseName}".`,
      ephemeral: true,
    });
  },
};
