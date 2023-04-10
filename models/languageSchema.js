const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
    guildID: { type: String, required: true },
    language: { type: String, required: true }
})

module.exports = mongoose.model('languageSchema', languageSchema);