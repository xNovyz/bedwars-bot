const { SlashCommandBuilder } = require('discord.js');
const { drafts } = require('../state');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pick')
    .setDescription('Sposta uno o più giocatori nel tuo canale (solo capitani)')
    .addUserOption((o) => o.setName('giocatore1').setDescription('Giocatore da pickare').setRequired(true))
    .addUserOption((o) => o.setName('giocatore2').setDescription('Giocatore da pickare').setRequired(false))
    .addUserOption((o) => o.setName('giocatore3').setDescription('Giocatore da pickare').setRequired(false))
    .addUserOption((o) => o.setName('giocatore4').setDescription('Giocatore da pickare').setRequired(false)),

  async execute(interaction) {
    const guild = interaction.guild;
    const draft = drafts.get(guild.id);

    if (!draft) {
      return interaction.reply({
        content: 'Non c\'è nessun draft attivo. Avvialo con `/startdraft`.',
        ephemeral: true,
      });
    }

    const userId = interaction.user.id;
    let teamChannelId;
    let teamName;

    if (userId === draft.redCaptain) {
      teamChannelId = draft.redChannelId;
      teamName = 'TEAM RED';
    } else if (userId === draft.greenCaptain) {
      teamChannelId = draft.greenChannelId;
      teamName = 'TEAM GREEN';
    } else {
      return interaction.reply({
        content: 'Solo i capitani possono usare questo comando.',
        ephemeral: true,
      });
    }

    const targets = ['giocatore1', 'giocatore2', 'giocatore3', 'giocatore4']
      .map((name) => interaction.options.getUser(name))
      .filter(Boolean);

    // Rimuovo eventuali duplicati
    const uniqueTargets = [...new Map(targets.map((u) => [u.id, u])).values()];

    await interaction.deferReply();

    const moved = [];
    const skipped = [];

    for (const user of uniqueTargets) {
      if (draft.picked.has(user.id)) {
        skipped.push(`${user} (già pickato)`);
        continue;
      }

      const member = await guild.members.fetch(user.id).catch(() => null);
      if (!member || !member.voice.channelId) {
        skipped.push(`${user} (non è in un canale vocale)`);
        continue;
      }

      try {
        await member.voice.setChannel(teamChannelId);
        draft.picked.add(user.id);
        moved.push(`${user}`);
      } catch (err) {
        skipped.push(`${user} (impossibile spostarlo)`);
      }
    }

    let reply = '';
    if (moved.length) {
      reply += `Spostati in **${teamName}**: ${moved.join(', ')}\n`;
    }
    if (skipped.length) {
      reply += `Non spostati: ${skipped.join(', ')}`;
    }
    if (!reply) {
      reply = 'Nessun giocatore valido indicato.';
    }

    await interaction.editReply(reply);
  },
};
