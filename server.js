// =======================
// get the packages we need ============
// =======================
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var helmet = require('helmet');


var passport = require('passport');
var Strategy = require('passport-local').Strategy;


var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User = require('./app/models/user'); // get our mongoose model

// =======================
// configuration =========
// =======================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


app.use(passport.initialize());
app.use(passport.session());





app.set('views', './app/views');
app.set('view engine', 'ejs');
// use morgan to log requests to the console
//app.use(morgan('dev'));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    res.setHeader('Access-Control-Allow-Headers', 'x-access-token, token');
    next();
});


app.get('/', function (req, res) {
    res.render('login');
});


app.get('/setup', function (req, res) {

    // create a sample user
    var nick = new User({
        name: 'n',
        password: 'n',
        admin: true
    });

    // save the sample user
    nick.save(function (err) {
        if (err) throw err;

        console.log('User saved successfully');
        res.json({
            success: true
        });
    });
});




app.get('/api/meee',
    passport.authenticate('bearer', {
        session: false
    }),
    function (req, res) {
        res.json(req.user);
    });

// API ROUTES -------------------

// get an instance of the router for api routes
var apiRoutes = express.Router();

// TODO: route to authenticate a user (POST http://localhost:8080/api/authenticate)







// route to show a random message (GET http://localhost:8080/api/)
app.get('/home', function (req, res) {
    res.json({
        message: 'Welcome to the coolest API on earth!'
    });

});

// route to return all users (GET http://localhost:8080/api/users)
app.get('/users', function (req, res) {

    User.find({}, function (err, users) {
        res.render('show');
        console.log('now i am at users list');
    });
});


app.listen(port);
console.log('Magic happens at http://localhost:' + port);