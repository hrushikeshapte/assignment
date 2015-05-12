var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var dbHelper = require('./dbHelper.js');
var session = require('express-session');
app.use(session({secret: 'ssshhhhh'}));
var http = require('http').Server(app);
var io = require("socket.io")(http);

app.use(bodyParser.urlencoded({
        extended: true
    }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));


var sess;


//Creating a connection & instantiating it for use.
//Goes through dbHelper.js Functions
var connection = dbHelper.initializeConnection({
    host: "localhost",
    user: "root",
    password: "",
    database : "vulcandb"
});

io.on('connection',function(socket){
    socket.on('message', function (message) {
        socket.broadcast.emit('message',sess.username + ' Updated profile');
    });
});


// set the view engine to ejs
app.set('view engine', 'ejs');

// index page
app.get('/', function(req, res) {

    if (res.session)
    {
        sess=req.session;
        console.log(sess.id);
        if(sess.id)
        {

            /*
             * This line check Session existence.
             * If it existed will do some action.
             */
            res.redirect('/showProfile?id='+sess.id);
        }

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

    sess=req.session;

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

        for (var i in rows) {

              var id = rows[i].id;
               console.log(id);
            sess.username = username;

            console.log('Success! User Found');

            sess.userId= id;
              res.redirect('/showProfile?id='+id);
        }

});

});

app.get('/search', function(req,res){
    res.render('pages/search');
});

app.get('/searchResults', function(req, res) {
    var search = req.query.searchname;
    var category = req.query.searchdropdown;
    var queryString;

    queryString = "SELECT db_id from phone_index where "+category+" = \'"+search+"\'";

    console.log(queryString);
    connection.query(queryString, function(err, rows, fields) {

        //Error check.
        if (rows.length==0)
        {
            res.render('pages/error-profile',{
                message: "User not found"
            });
        }

        for (var i in rows) {
             var dbID = rows[i].db_id;

           res.redirect('/showProfile?id='+dbID);


        }

    });
});

app.get('/showProfile', function(req,res){


    var id;
    if(req.query.id){
         id = req.query.id;
        console.log("got query id="+id);
    }
    else{
        sess=req.session;
        id = sess.userId;
        console.log("got session id="+id);
    }
    console.log(id);
    queryString = "SELECT * FROM users WHERE id = '"+id+"'" ;

    connection.query(queryString, function(err, rows, fields) {

        //Error check.
        if (rows.length==0)
        {
            res.render('pages/error',{
                message: "User not found"
            });
        }

        for (var i in rows) {

            //Get raw json
            var rawProfileJson = rows[i].profile;
            //Process it.
            var profile = JSON.parse(rawProfileJson);
            var uname = rows[i].username;

            res.render('pages/profile',{
                username: uname,
                profile: profile
            });
        }

    });

});

app.get('/logout', function(req, res) {
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        }
        else
        {
            res.redirect('/');
        }
    });
});

app.get('/edit', function(req,res){
    var queryString = "SELECT * from users where id = '"+sess.userId+"'";
    connection.query(queryString, function(err, rows, fields) {
        if (rows.length==0)
        {

            res.render('pages/error-profile',{
                message: "User not authorized"
            });
        }

        else{
            for (var i in rows) {

                //Get raw json
                var rawProfileJson = rows[i].profile;
                //Process it.
                var profile = JSON.parse(rawProfileJson);
                var uname = rows[i].username;

            }

            res.render('pages/edit',{
                username: uname,
                profile: profile
            });

        }
    });

});

app.get('/editProfile', function(req,res){

    var phone = req.query.phone;
    var email = req.query.email;
    var country = req.query.country;

    var profile = new Object();
    profile.phone = phone;
    profile.email = email;
    profile.country = country;

    var profileJson = JSON.stringify(profile);

    var queryString = "UPDATE users SET profile='"+ profileJson +"'  WHERE id = '"+sess.userId+"'";

    sess.profile = profile;

    connection.query(queryString, function(err, rows, fields) {
        if (rows.length==0)
        {

            res.render('pages/error-profile',{
                message: "User not authorized"
            });
        }

        else{
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');

            res.redirect('/showProfile?id='+sess.userId);
        }
    });
});

http.listen(8080);

