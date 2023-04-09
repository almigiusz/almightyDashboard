const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');

const User = require('./models/user');
const prefixSchema = require('./models/prefixSchema.js');

dotenv.config();

const app = express();
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Połączono z bazą danych MongoDB.'))
    .catch(err => console.log(err));

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURI: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'guilds', 'guilds.join']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await User.findOneAndUpdate({ discordId: profile.id }, {
            discordAccessToken: accessToken,
            discordRefreshToken: refreshToken,
            username: profile.username,
            discriminator: profile.discriminator,
            avatar: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
            email: profile.email,
        }, { upsert: true, new: true });

        const guilds = profile.guilds.filter(guild => (guild.permissions & 0x8) === 0x8).map(guild => {
            return {
                id: guild.id,
                name: guild.name,
                icon: guild.icon && `https:cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`,
            };
        });


        done(null, { user: user, guilds: guilds });
    } catch (err) {
        done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser(async (user, done) => {
    try {
        const foundUser = await User.findById(user._id);
        done(null, foundUser);
    } catch (err) {
        done(err, null);
    }
});

app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/guilds', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
    const user = req.user;
    const guilds = req.user.guilds;
    console.log(user);
    req.session.user = user;
    req.session.guilds = guilds;

    res.render('guilds', { user: user, guilds: guilds });
});

app.use(function (err, req, res, next) {
    res.status(500);
    console.log(err);
    res.render('error', { error: err });
});

app.get('/guilds/:serverID', (req, res) => {
    const user = req.session.user;
    const guilds = req.session.guilds;

    if (!user) {
        res.redirect('/auth/discord');
        return;
    }

    const serverID = req.params.serverID;

    const guild = guilds.find(g => g.id === serverID);
    if (!guild) {
        res.status(404).send('Wystąpił błąd.');
        return;
    }

    res.render('server', { user: user, guild: guild });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get('/', (req, res) => {
    res.render('index');
});

app.use(express.urlencoded({ extended: true }));

app.post('/guilds/:serverID/settings', async (req, res) => {
    const prefix = req.body.prefix;
    const serverID = req.params.serverID;

    await prefixSchema.findOneAndUpdate({ guildID: serverID }, { prefix: prefix });

    res.redirect(`/guilds/${serverID}`);
});

app.listen(2137, () => {
    console.log('Serwer uruchomiony na porcie 2137.');
});