/*mongoose setup*/
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/user-db');
const Profile = require('./database/models/profile');
const Entries = require('./database/models/entries');;

/*mongoose client setup*/
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

/*express setup*/
const express = require ('express');
const app = express();

const bodyParser = require('body-parser');
const expressSession = require('express-session')({
    secret: 'top secret',
    resave: false,
    saveUninitialized: false
});

/*handlebars setup*/
const hbs = require('hbs');
app.set('view engine', 'hbs');

app.use(express.static(__dirname));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true })); //false before
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(expressSession);

/*passport setup*/
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
const localStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
app.use(passport.initialize());
app.use(passport.session());

/*passport local authentication*/
passport.use(Profile.createStrategy());
passport.serializeUser(Profile.serializeUser());
passport.deserializeUser(Profile.deserializeUser());

const connectEnsureLogin = require('connect-ensure-login');

/*routes*/
app.get('/', function (req, res) {
    res.render('indexContent');
});

app.get('/login', function (req, res) {
    res.render('indexContent');
});

app.post("/submit-login", passport.authenticate("local",{
    successRedirect: "/homepage", //
    failureRedirect: "/"
}), function(req, res){

});

app.get('/registerPage', function (req, res) {
    res.render('registerPageContent');
});

app.post('/submit-registerPage', function (req, res) {
    Profile.register(new Profile({username: req.body.username, firstname: req.body.firstname, lastname: req.body.lastname, color: req.body.color/*, password1: req.body.password1*/}), req.body.password1, function(err, user){
        if(err){
            console.log(err);
            return res.render('registerPageContent');
        }
        
        return res.render('indexContent');
    });
});

app.get("/homepage", connectEnsureLogin.ensureLoggedIn(), function(req, res){
    res.render('homepageContent');
});

app.post('/submit-searchDate', connectEnsureLogin.ensureLoggedIn(), async(req, res) => {
    var query = {
        date : req.body.dateSearchInput, 
        username : req.user.username
    };
    const entry = await Entries.find(query);
    res.render('searchByDateContent', {entry});
});

app.post('/submit-searchMood', connectEnsureLogin.ensureLoggedIn(), async(req, res) => {
    var query = {
        mood : req.body.mood, 
        username : req.user.username
    };
    const entry = await Entries.find(query);
    res.render('searchByMoodContent', {entry});
});

app.get('/createPost', connectEnsureLogin.ensureLoggedIn(), function (req, res) {
    res.render('createPostContent');
});

app.post('/submit-createPost', connectEnsureLogin.ensureLoggedIn(), function (req, res) {
    try {
        Entries.create({
            username: req.user.username,
            date: req.body.date,
            mood: req.body.mood,
            factors: req.body.factors,
            description: req.body.description
        }, (error, post) => {
            res.render('homepageContent');
        });
    } catch {
        res.render('createPostContent');
    }
});

app.get('/searchUser', connectEnsureLogin.ensureLoggedIn(), function (req, res) {
    res.render('searchUserContent');
});

app.post('/submit-searchUser', connectEnsureLogin.ensureLoggedIn(), async(req, res) => {
    var query = { username : req.body.search};
    var happy = {
        username: req.body.search,
        mood: 'happy'
    };
    const user = await Profile.find(query);
    const factorsHappy = await Entries.find(happy);
    res.render('searchUserContent', {user, factorsHappy});
});

app.get('/viewAll', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    const counts = [];

    var countHappy = await Entries.countDocuments({
        username: req.user.username,
        mood: 'happy'
    });

    var countSad = await Entries.countDocuments({
        username: req.user.username,
        mood: 'sad'
    });

    var countDisgusted = await Entries.countDocuments({
        username: req.user.username,
        mood: 'disgusted'
    });

    var countBored = await Entries.countDocuments({
        username: req.user.username,
        mood: 'bored'
    });

    var countInspired = await Entries.countDocuments({
        username: req.user.username,
        mood: 'inspired'
    });

    var countTired = await Entries.countDocuments({
        username: req.user.username,
        mood: 'tired'
    });

    var countAngry = await Entries.countDocuments({
        username: req.user.username,
        mood: 'angry'
    });

    var countHurt = await Entries.countDocuments({
        username: req.user.username,
        mood: 'hurt'
    });

    counts.push(countHappy);
    counts.push(countSad);
    counts.push(countDisgusted);
    counts.push(countBored);
    counts.push(countInspired);
    counts.push(countTired);
    counts.push(countAngry);
    counts.push(countHurt);

    var i;
    var maxMood;
    var max = -Infinity;
    for(i = 0; i < 8; i++){
        if (counts[i] > max)
            {max = counts[i];
        
            if (i == 0)
                maxMood = 'happy';

            else if (i == 1)
                maxMood = 'sad'

            else if (i == 2)
                maxMood = 'disgusted'

            else if (i == 3)
                maxMood = 'bored'

            else if (i == 4)
                maxMood = 'inspired'
        
            else if (i == 5)
                maxMood = 'tired'

            else if (i == 6)
                maxMood = 'angry'

            else if (i == 7)
                maxMood = 'hurt'
        }
    };

    var happy = {
        username: req.user.username,
        mood : 'happy'
    };

    var sad = {
        username: req.user.username,
        mood : 'sad'
    };

    const factorsHappy = await Entries.find(happy);
    const factorsSad = await Entries.find(sad);
    res.render('viewAllContent', {countHappy, countSad, countDisgusted, countBored, countInspired, countTired, countAngry, countHurt, maxMood, factorsHappy, factorsSad});
});

app.get('/viewProfile', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    var query = { 
        username: req.user.username
    };
    const user = await Profile.find(query);
    res.render('viewProfileContent', {user});
});

app.get('/editProfile', connectEnsureLogin.ensureLoggedIn(), function(req, res){
    res.render('editProfileContent');
});

app.post('/submit-editProfile', connectEnsureLogin.ensureLoggedIn(), async(req, res) => {
    var query = { 
        username: req.user.username
    };

    var newUsername = {
        username: req.body.username
    }

    await Profile.updateOne(query, req.body);
    await Entries.updateMany(query, newUsername); 
    res.redirect('/login');
})

app.get('/logout', connectEnsureLogin.ensureLoggedIn(), function(req, res){
    req.logout();
    res.render('indexContent');
});

app.get('/deleteAccount', connectEnsureLogin.ensureLoggedIn(), function(req, res){
    var query = { 
        username: req.user.username
    };
    Entries.find(query).remove().exec();
    Profile.find(query).remove().exec();
    res.render('indexContent');
});

var server = app.listen(5000, function(){
    console.log("Listening on port 5000...");
});