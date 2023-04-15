const express = require('express');
const router = express.Router();

const { Client, Intents } = require('discord.js');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

router.get('/', (req, res) => {
    const isAuthenticated = req.session.user ? req.session.user : false;
    res.render('index', { client: client, isAuthenticated });
});

router.get('/commands', (req, res) => {
    res.render('commands');
});

client.login(process.env.DISCORD_TOKEN);

module.exports = router;
