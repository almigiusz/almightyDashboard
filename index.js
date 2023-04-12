const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const session = require('express-session');

const { Client, Intents } = require('discord.js');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

const dotenv = require('dotenv');
dotenv.config();

const authRouter = require('./routes/auth/auth');
const guildsRouter = require('./routes/guilds/guilds');

const app = express();
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Połączono z bazą danych MongoDB.'))
    .catch(err => console.log(err));


app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));
app.use('/auth', authRouter);
app.use('/guilds', guildsRouter);

app.get('/', (req, res) => {
    res.render('index', { client: client });
});

app.use((err, req, res, next) => {
    res.status(500);
    console.log(err);
    res.render('error', { error: err });
});

client.login(process.env.DISCORD_TOKEN);
app.listen(2137, () => {
    console.log('Serwer uruchomiony na porcie 2137.');
});