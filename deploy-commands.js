require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Registrazione di ${commands.length} comandi...`);

    if (process.env.GUILD_ID) {
      // Registrazione su un singolo server: istantanea, ideale per i test
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands },
      );
      console.log('Comandi registrati sul server di test.');
    } else {
      // Registrazione globale: può richiedere fino a un'ora per propagarsi
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
      console.log('Comandi registrati globalmente.');
    }
  } catch (err) {
    console.error(err);
  }
})();
