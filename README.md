# Bedwars Draft Bot

Bot Discord per organizzare le ranked Bedwars con gli amici: sceglie 2 capitani, crea i canali
vocali delle squadre e permette ai capitani di "pickare" i giocatori.

## Comandi

- **/startdraft lobby:<canale vocale>** — sceglie 2 capitani a caso tra chi è connesso al canale
  indicato, crea i canali vocali `TEAM RED` e `TEAM GREEN` e sposta i capitani nei rispettivi canali.
- **/pick giocatore1 giocatore2 ...** — utilizzabile solo dai capitani. Sposta nel proprio canale
  fino a 4 giocatori alla volta (basta menzionarli come opzioni del comando).
- **/enddraft** — termina il draft: riporta chi è rimasto nei canali squadra alla lobby ed elimina
  i canali `TEAM RED` / `TEAM GREEN`. (comando bonus, utile per non lasciare canali vuoti in giro)

## Setup

### 1. Crea l'applicazione Discord

1. Vai su https://discord.com/developers/applications e crea una nuova applicazione.
2. Nella sezione **Bot**, crea il bot e copia il **Token**.
3. Sempre nella sezione **Bot**, attiva l'intent privilegiato **Server Members Intent** (serve per
   leggere chi è connesso ai canali vocali).
4. In **General Information** copia l'**Application ID**.

### 2. Invita il bot nel tuo server

Genera un link di invito da **OAuth2 > URL Generator**:
- Scope: `bot`, `applications.commands`
- Permessi bot: `Manage Channels`, `Move Members`, `View Channels`, `Connect`, `Send Messages`

Apri il link generato e aggiungi il bot al tuo server.

### 3. Configura il progetto

```bash
npm install
cp .env.example .env
```

Apri `.env` e inserisci:
- `DISCORD_TOKEN` — il token del bot
- `CLIENT_ID` — l'Application ID
- `GUILD_ID` — l'ID del tuo server (tasto destro sul server con la modalità sviluppatore attiva
  su Discord > "Copia ID server"). Usarlo rende la registrazione dei comandi istantanea, utile
  in fase di test.

### 4. Registra gli slash command e avvia il bot

```bash
npm run deploy
npm start
```

## Uso tipico

1. Tutti i giocatori si connettono a un canale vocale "lobby".
2. Un membro qualsiasi esegue `/startdraft lobby:#nome-canale`.
3. Il bot sceglie 2 capitani, crea `TEAM RED` e `TEAM GREEN` e li sposta lì.
4. I due capitani si alternano usando `/pick @giocatore1 @giocatore2` per scegliere i propri
   compagni di squadra (fino a 4 alla volta), finché la lobby non si svuota.
5. A fine partita, `/enddraft` pulisce i canali.

## Note

- Lo stato dei draft è tenuto in memoria: se il bot viene riavviato, un draft in corso viene perso.
- Se hai bisogno di più di 4 pick alla volta, basta duplicare le righe `addUserOption` in
  `commands/pick.js` (es. `giocatore5`, `giocatore6`, ...).
