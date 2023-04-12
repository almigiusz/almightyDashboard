const express = require('express');
const router = express.Router();

const DiscordStrategy = require('passport-discord');
const passport = require('passport');

const User = require('../../models/user');

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURI: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'guilds', 'guilds.join', 'guilds.members.read']
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

        const guilds = profile.guilds
            .filter(guild => (guild.permissions & 0x8) === 0x8)
            .map(guild => {
                return {
                    id: guild.id,
                    name: guild.name,
                    icon: guild.icon && `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`,
                }
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

router.get('/discord', passport.authenticate('discord'));
router.get('/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
    req.session.user = req.user;
    req.session.guilds = req.user.guilds;

    res.redirect('/guilds')
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;
