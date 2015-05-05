var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var dbHelper = require('./dbHelper.js');
var session = require('cookie-session');
app.use(session({secret: 'ssshhhhh'}));
var http = require('http').Server(app);
var io = require("socket.io")(http);

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

io.on('connection',function(socket){
    socket.on('message', function (data) {
        socket.broadcast.emit('news', { user: sess.username });
    });
});

var sess;

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
    sess=req.session;
    if(sess.username)
    {
        /*
         * This line check Session existence.
         * If it existed will do some action.
         */
        res.render('pages/profile',{
            username: sess.username, //this is how you pass variables to ejs.
            profile: sess.profile //read this variable in ejs by <%= profile %>
        });
    }
    else{
    res.render('pages/index');
    }
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

              console.log('Success! User Found');

            sess=req.session;
//In this we are assigning email to sess.email variable.
//email comes from HTML page.
            sess.username= uname;
            sess.profile = profile;
              
              res.render('pages/profile',{
                  username: uname, //this is how you pass variables to ejs.
                  profile: profile //read this variable in ejs by <%= profile %>
              });
        }


});


});

app.get('/search', function(req,res){
    res.render('pages/search');
});

app.get('/searchResults', function(req, res) {
    var search = req.query.searchname;
    console.log(search);
    var category = req.query.searchdropdown;
    var queryString;

    if(category == "phone"){
        queryString = "SELECT * FROM users WHERE profile LIKE \"%\"\""+category +"\"\":"+search+"%\"" ;
    }
    else{
        queryString = "SELECT * FROM users WHERE profile LIKE \"%\"\""+category +"\"\": \"\""+search+"\"\"%\"" ;
    }

    console.log(queryString);
    connection.query(queryString, function(err, rows, fields) {

        //Error check.
        if (rows.length==0)
        {
            res.render('pages/error',{
                message: "User not found"
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

            console.log('Success! User Found');

            res.render('pages/profile',{
                username: uname, //this is how you pass variables to ejs.
                profile: profile //read this variable in ejs by <%= profile %>
            });
        }


    });
});

app.get('/logout', function(req, res) {
    req.session = null;
    res.redirect('/');
});

app.get('/edit', function(req,res){
    res.render('pages/edit',{
        username: sess.username,
         profile: sess.profile//this is how you pass variables to ejs.
    });
});

//var add_status = function (status,callback) {
app.get('/editProfile', function(req,res){

    var phone = req.query.phone;
    var email = req.query.email;
    var country = req.query.country;

    var profile = new Object();
    profile.phone = phone;
    profile.email = email;
    profile.country = country;

    var profileJson = JSON.stringify(profile);
    console.log(profileJson);

    var queryString = "UPDATE users SET profile='"+ profileJson +"'  WHERE username = '"+sess.username+"'";

    connection.query(queryString, function(err, rows, fields) {
        if (rows.length==0)
        {
  //          callback(false);
            res.render('pages/error',{
                message: "User not authorized"
            });
    //        callback(false);
            console.log("Error");
        }

        else{
      //      callback(true);
            res.render('pages/profile',{
                username: sess.username, //this is how you pass variables to ejs.
                profile: profile //read this variable in ejs by <%= profile %>
            });
        }
    });
});
//}


http.listen(8080);
console.log('8080 is the magic port');
