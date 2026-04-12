if (interaction.isButton() && interaction.customId === 'setup_add_dropdown') {

  const modal = new ModalBuilder()
    .setCustomId('modal_add_dropdown')
    .setTitle('Add Dropdown Option');

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('emoji')
        .setLabel('Emoji')
        .setStyle(TextInputStyle.Short)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('name')
        .setLabel('Name')
        .setStyle(TextInputStyle.Short)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('desc')
        .setLabel('Description')
        .setStyle(TextInputStyle.Paragraph)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('category')
        .setLabel('Channel Category ID')
        .setPlaceholder('Paste Discord Category ID')
        .setStyle(TextInputStyle.Short)
    )
  );

  return interaction.showModal(modal);
}
