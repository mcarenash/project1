var express        = require('express');
var ejs            = require('ejs');
var app            = express();
var path	       = require('path');
var bodyParser 	   = require('body-parser');
var cookieParser   = require('cookie-parser');
var session        = require('express-session');
var LocalStrategy  = require('passport-local').Strategy;
var passport       = require('passport');
var db             = require('./db.js');
var methodOverride = require('method-override');

app.set('view engine','ejs');
app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':true}));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	db.query('SELECT * FROM users WHERE id = $1', [id], function(err, dbRes) {
		if (!err) {
			done(err, dbRes.rows[0]);
		}
	});
});

app.listen(8080, function(){
	console.log('Server is running in port 8080')
});


var localStrategy = new LocalStrategy(
  function(username, password, done) {
    db.query('SELECT * FROM users WHERE username = $1', [username], function(err, dbRes) {
    	var user = dbRes.rows[0];
    	console.log(username)

    	console.log(user);


      if (err) { return done(err); }
      if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
      if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
      return done(null, user);
    })
  }
);

passport.use(localStrategy);

app.get('/', function(req, res) {
	res.render('index', { user: req.user });
});

app.get('/maps', function(req, res) {
	db.query('SELECT * FROM boards', function(err, dbRes){
		console.log(dbRes)
		if(!err) {
			res.render('maps', { location: req.query.location,
								surfboards: dbRes.rows,
							    cho: 787});
		}
	})

});
	
	// res.render('maps', { location: req.query.location ,
	//                       // surfboards: results
	//                   });


app.get('/try', function(req, res){

	db.query('SELECT * FROM boards', function(err, dbRes){
		
		if(!err) {
			res.render('try',{surfboards:dbRes.rows})
		}
	})
});

app.get('/users/new', function(req, res) {
	res.render('users/new');
});

// app.get('/sessions/newBoard', function(req, res) {
// 	res.render('sessions/newBoard');
// });


app.post('/users', function(req, res) {
	db.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [req.body.username, req.body.email, req.body.password], function(err, dbRes) {
			if (!err) {
				res.redirect('/sessions/new');
			}
	});
});

// app.get('/try', function(req, res){
// 	// var a=req.params.username

// 	db.query('SELECT location FROM boards', function(err, dbRes){
		
// 		if(!err) {
// 			res.render('try', {surfboards: dbRes.rows})
// 		}
// 	})
// })



app.post('/boards', function(req, res){
	db.query('INSERT INTO boards (board, price, location, contact, user_id, cx, cy) VALUES ($1, $2, $3, $4, $5, $6, $7)', [req.body.surfBoard, req.body.price, req.body.location, req.body.email, req.user.id, req.body.cx, req.body.cy], function(err, dbRes){
		if(!err){
			res.redirect('/');
		}
	});
});

app.get('/sessions/new', function(req, res) {
	res.render('sessions/new');
});

app.get('/boards/newBoard', function(req, res) {
	// If logged in...
	if (req.user) {
		res.render('boards/newBoard');
	} else {
		// If not logged in...
		res.redirect('/');
	}
});

app.get('/try', function(req, res){
	res.render('try');
})

app.get('/users/new', function(req, res) {
	res.render('users/new');
});

// Session routes
app.get('/sessions/new', function(req, res) {
	res.render('sessions/new');
});

app.post('/sessions', passport.authenticate('local', 
  {failureRedirect: '/sessions/new'}), function(req, res) {
    res.redirect('/');
});

app.delete('/sessions', function(req, res) {
	req.logout();
	res.redirect('/');
});

