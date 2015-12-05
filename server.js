// =======================
// get the packages we need ============
// =======================
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var helmet		= require('helmet');


var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose model
    
// =======================
// configuration =========
// =======================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.set('views', './app/views');
app.set('view engine', 'ejs');
// use morgan to log requests to the console
app.use(morgan('dev'));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    res.setHeader('Access-Control-Allow-Headers', 'x-access-token, token');
    next();
});

app.disable('etag');

//app.use(helmet);

//app.disable('x-powered-by');

// =======================
// routes ================
// =======================
// basic route
app.get('/', function(req, res) {
    //res.send('Hello! The API is at http://localhost:' + port + '/api');

    res.render('login');
});

// API ROUTES -------------------
// we'll get to these in a second


app.get('/setup', function(req, res) {

  // create a sample user
  var nick = new User({ 
    name: 'nur farazi', 
    password: 'password',
    admin: true 
  });

  // save the sample user
  nick.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});




// API ROUTES -------------------

// get an instance of the router for api routes
var apiRoutes = express.Router(); 

// TODO: route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
        // expires in 4 hours
        });

        // return the information including token as JSON
      
        //res.setHeader("x-access-token",token);

//console.log(localStorage.getItem("lastname"));
        
      
   /*     res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });*/


      var body = "hello world";
      res.writeHead(200, {
    "Content-Length": body.length,
    "Content-Type": "text/plain",
    "x-access-token":token,
    'Location': "/api/users"
     });



         res.end();
         console.log('token saved '+res.getHeader('x-access-token'));
         









      }   

    }

  });
});

function redirect (url,res) {

   res.redirect = function (url) {
    res.setHeader('Location', url);
     res.writeHead(302);
     res.end('Redirect to ' + url);
   }
 }


apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
 var token = req.body.token || req.query.token || req.headers['x-access-token'];
  //var token =  req.getHeader['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;   
        //res.end();
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
    
  }
});


// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });

});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res) {

  User.find({}, function(err, users) {
    res.render('show');
    console.log('now i am at users list');
  });
});   

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);


// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);