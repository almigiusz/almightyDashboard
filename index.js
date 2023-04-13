const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const session = require('express-session');

const dotenv = require('dotenv');
dotenv.config();

const authRouter = require('./routes/auth/auth');
const guildsRouter = require('./routes/guilds/guilds');
const publicRouter = require('./routes/public/public');

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
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());


app.use('/auth', authRouter);
app.use('/guilds', guildsRouter);
app.use('/', publicRouter);

app.use((err, req, res, next) => {
    res.status(500);
    console.log(err);
    res.render('error', { error: err });
});

app.listen(2137, () => {
    console.log('Serwer uruchomiony na porcie 2137.');
});