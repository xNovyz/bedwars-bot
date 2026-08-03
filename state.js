// Stato dei draft attivi, tenuto in memoria.
// Chiave: guildId -> { lobbyChannelId, redChannelId, greenChannelId,
//                       redCaptain, greenCaptain, picked: Set<string> }
const drafts = new Map();

module.exports = { drafts };
