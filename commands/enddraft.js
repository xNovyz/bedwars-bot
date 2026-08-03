const { SlashCommandBuilder } = require('discord.js');
const { drafts } = require('../state');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('enddraft')
    .setDescription('Termina il draft ed elimina i canali TEAM RED / TEAM GREEN'),

  async execute(interaction) {
    const guild = interaction.guild;
    const draft = drafts.get(guild.id);

    if (!draft) {
      return interaction.reply({
        content: 'Non c\'è nessun draft attivo da terminare.',
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    for (const channelId of [draft.redChannelId, draft.greenChannelId]) {
      const channel = await guild.channels.fetch(channelId).catch(() => null);
      if (channel) {
        // Sposto eventuali membri rimasti nel canale della lobby prima di eliminarlo
        const lobby = await guild.channels.fetch(draft.lobbyChannelId).catch(() => null);
        for (const member of channel.members.values()) {
          if (lobby) await member.voice.setChannel(lobby).catch(() => null);
        }
        await channel.delete().catch(() => null);
      }
    }

    drafts.delete(guild.id);
    await interaction.editReply('Draft terminato. I canali delle squadre sono stati eliminati.');
  },
};
