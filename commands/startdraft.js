const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { drafts } = require('../state');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('startdraft')
    .setDescription('Avvia il draft: sceglie 2 capitani e crea i canali vocali delle squadre')
    .addChannelOption((option) =>
      option
        .setName('lobby')
        .setDescription('Canale vocale dove si trovano tutti i giocatori')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true),
    ),

  async execute(interaction) {
    const lobby = interaction.options.getChannel('lobby');
    const guild = interaction.guild;

    // Prendo solo i membri umani effettivamente connessi al canale
    const members = [...lobby.members.values()].filter((m) => !m.user.bot);

    if (members.length < 2) {
      return interaction.reply({
        content: `Nel canale ${lobby} servono almeno 2 giocatori per avviare il draft.`,
        ephemeral: true,
      });
    }

    // Scelgo 2 capitani a caso e distinti
    const shuffled = [...members].sort(() => Math.random() - 0.5);
    const [captainRed, captainGreen] = shuffled;

    await interaction.deferReply();

    try {
      const redChannel = await guild.channels.create({
        name: 'TEAM RED',
        type: ChannelType.GuildVoice,
        parent: lobby.parentId ?? null,
        permissionOverwrites: lobby.parentId ? undefined : [
          {
            id: guild.roles.everyone.id,
            allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel],
          },
        ],
      });

      const greenChannel = await guild.channels.create({
        name: 'TEAM GREEN',
        type: ChannelType.GuildVoice,
        parent: lobby.parentId ?? null,
      });

      await captainRed.voice.setChannel(redChannel).catch(() => null);
      await captainGreen.voice.setChannel(greenChannel).catch(() => null);

      drafts.set(guild.id, {
        lobbyChannelId: lobby.id,
        redChannelId: redChannel.id,
        greenChannelId: greenChannel.id,
        redCaptain: captainRed.id,
        greenCaptain: captainGreen.id,
        picked: new Set([captainRed.id, captainGreen.id]),
      });

      await interaction.editReply(
        `**Draft avviato!**\n\n` +
          `🔴 Capitano Team Red: ${captainRed}\n` +
          `🟢 Capitano Team Green: ${captainGreen}\n\n` +
          `I capitani sono stati spostati nei rispettivi canali vocali.\n` +
          `Ora i capitani possono usare \`/pick\` (menzionando fino a 4 giocatori alla volta) per scegliere i membri della squadra dal canale ${lobby}.`,
      );
    } catch (err) {
      console.error(err);
      await interaction.editReply(
        'Non sono riuscito a creare i canali o spostare i capitani. Controlla che io abbia i permessi "Gestisci Canali" e "Sposta Membri".',
      );
    }
  },
};
