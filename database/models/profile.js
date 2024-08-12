const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const ProfileSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    color: String,
});

ProfileSchema.plugin(passportLocalMongoose);
const Profile = mongoose.model('Profile', ProfileSchema);
module.exports = Profile;