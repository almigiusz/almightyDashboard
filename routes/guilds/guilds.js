const express = require('express');
const router = express.Router();

const { Client, Intents } = require('discord.js');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

const prefixSchema = require('../../models/prefixSchema');
const languageSchema = require('../../models/languageSchema');

router.get('/', async (req, res) => {
    const user = req.session.user;
    const guilds = req.session.guilds;
    const botGuilds = [];

    if (!user) {
        return res.redirect('/auth/discord');
    }

    const botGuildIds = client.guilds.cache.map((guild) => guild.id);

    const fetchGuilds = guilds.filter((guild) => botGuildIds.includes(guild.id))
        .map((guild) => client.guilds.fetch(guild.id));

    const fetchedGuilds = await Promise.all(fetchGuilds);

    fetchedGuilds.forEach((guild) => {
        botGuilds.push(guild);
    });

    const missingGuilds = botGuilds.filter((guild) => !guild.name);

    if (missingGuilds.length > 0) {
        return res.send(`Waiting for guild information to be fetched for: ${missingGuilds.map((guild) => guild.id)}. Please try refreshing the page. If needed, try doing it multiple times.`);
    }

    res.render('guilds', { user: user, guilds: botGuilds });
});

router.get('/:serverID', (req, res) => {
    const user = req.session.user;
    const guilds = req.session.guilds;

    if (!user) {
        return res.redirect('/auth/discord');
    }

    const serverID = req.params.serverID;

    const guild = guilds.find(g => g.id === serverID);

    if (!guild) {
        res.status(404).send('Wystąpił błąd.');
        return;
    }

    res.render('server', { user: user, guild: guild });
});

router.post('/:serverID/settings', async (req, res) => {
    const prefix = req.body.prefix;
    const language = req.body.language;
    const serverID = req.params.serverID;

    await prefixSchema.findOneAndUpdate({ guildID: serverID }, { prefix: prefix });
    await languageSchema.findOneAndUpdate({ guildID: serverID }, { language: language });

    res.redirect(`/guilds/${serverID}`);
});

client.login(process.env.DISCORD_TOKEN);
module.exports = router;
