const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const EntriesSchema = new mongoose.Schema({
    username: String,
    date: String,
    mood: String,
    factors: String,
    description: String
});

const Entries = mongoose.model('Entries', EntriesSchema);
module.exports = Entries;