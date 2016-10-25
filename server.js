var express = require('express'); // OK
var bodyParser = require('body-parser'); // OK
var User = require('./models/user'); // OK
var session = require("express-session"); // OK

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan'); 
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose'); 
var passport = require('passport');
var flash = require('connect-flash');
var LocalStrategy = require('passport-local').Strategy;

var app = express();

var routes = require('./routes/index');
var users = require('./routes/users');

app.use(session({
  secret: "trucounrc",
  resave: false,
  saveUninitialized: false
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
 
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/static', express.static('/public'));
app.use(express.static(__dirname + "/public/images"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

/*
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      console.log(username);
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password != password){
      //if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
)); 
*/
/*
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username : req.body.username}, function(err, user) {
      //console.log(req.body.username);
      //console.log(req.body.password);
      if (err) { return err; } 
      if (!user) { 
        return res.render("login", { message: 'Usuario incorrecto.' });
      }
      if (!user.validPassword(pass)) {
        return res.render("login", { message: 'Contraseña incorrecta.' });
      }
      return res.redirect('/myacc');
    });
  }
));

*/
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())

// mongoose
//mongoose.promise = global.promise;
mongoose.connect('mongodb://localhost/truco-development');


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
