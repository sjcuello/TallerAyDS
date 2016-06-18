var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var router = express.Router();

var Game = require("../models/game").game;

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

// ===================================================================================================================
// ROUTER GET / POST MYACC, WORKING.
router.get('/myacc', function(req, res){
    res.render('myacc', {user: req.user});
    //res.status(200).render('myacc', { user : req.user });
    //res.status(200).send("pong!");
});

router.post('/myacc'), function(req,res) {
    res.render('myacc');
}

// ===================================================================================================================
// ROUTER GET / POST REGISTER, IT'S WORKING.
router.get('/register', function(req, res) {
    res.render('register', { });
});
router.post('/register', function(req, res) {
    User.register(new User({ username : req.body.username }), req.body.password, /*req.body.password_confirmation,*/function(err, user) {
        if (err) {
            return res.render('register', { user : user });
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/myacc');
        });
    });
});
// ===================================================================================================================
// ROUTER GET / POST LOGIN, IT'S WORKING.
router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', 
    passport.authenticate('local', 
    { successRedirect : '/myacc',    
    failureRedirect: '/login' })
);

// ===================================================================================================================
// ROUTER GET LOGOUT
router.get('/logout', function(req, res) {
    req.logout();
    //res.
    res.redirect('/');
});

// ===================================================================================================================
router.get('/play', function(req, res){
    var game = new Game();
    //game.play('player1','envido');    
    res.render('play');
});


// ===================================================================================================================

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

module.exports = router;
/*
router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});
*/
/*
router.post("/sessions", function(req,res){
    User.findOne({email: req.body.email ,password:req.body.password},function(err,user){
        req.session.user_id = user._id;
        res.redirect("/");
        // _id , asignacion de mongo unica para la base de datos.       
    });
});*/

/*
router.post('/login', 
    passport.authenticate('local', 
    {successRedirect : '/',
    successFlash: 'Welcome!',     
    failureRedirect: '/login', 
    failureFlash: true 
}));*/

/*
app.post('/login', passport.authenticate('local', { successRedirect: '/',
                                                    failureRedirect: '/login' }));

router.post('/login', function(req,res){
    if (err) {
        return res.render('login', { user : user });
    }
    passport.authenticate('local')(req, res, function () {
        res.redirect('/register');
    });
});
*/
