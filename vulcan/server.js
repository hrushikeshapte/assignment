var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var dbHelper = require('./dbHelper.js')

app.use(bodyParser.urlencoded({
        extended: true
    }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));




//Creating a connection & instantiating it for use.
//Goes through dbHelper.js Functions
var connection = dbHelper.initializeConnection({
    host: "localhost",
    user: "root",
    password: "",
    database : "vulcandb"
});



// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
    res.render('pages/index');
});


// handles the login request
app.get('/login', function(req,res){
    // pull the form variables off the request body
    var username = req.query.username;
    var password = req.query.passwords;


    //generate our query string
    var queryString = "SELECT * FROM users WHERE username=\'"+username+"\' AND password = \'"+password+"\'";

    //query
    connection.query(queryString, function(err, rows, fields) {

        //Error check.
        if (rows.length==0)
        {
          res.render('pages/error',{
              message: "User not authorized"
          });
          console.log("Error");
        }

        // if rows is >0 this will be executed. Otherwise not.
        // Technically you should check for rows.length ==1 but the random
        // algo doesn't guarantee uniqueness so you may get multiple users.
        for (var i in rows) {

              //Get raw json
              var rawProfileJson = rows[i].profile;
              //Process it.
              var profile = JSON.parse(rawProfileJson);
              var uname = rows[i].username;

              //res.json(200,{"result": "success"});
              console.log('Success! User Found');
              res.render('pages/profile',{
                  username: uname,
                  profile: profile
              });
        }


});


});


app.listen(8080);
console.log('8080 is the magic port');
