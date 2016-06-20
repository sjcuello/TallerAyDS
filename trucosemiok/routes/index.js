var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var router = express.Router();

var Game = require("../models/game").game;
var Player = require("../models/player").player;
var g = undefined;


/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

// ===================================================================================================================
// ROUTER GET / POST MYACC, WORKING.
router.get('/myacc', function(req, res){
    res.render('myacc', {user: req.user});
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

/*
router.post('/login', 
    passport.authenticate('local',{ failureRedirect: '/login' , failureFlash: 'Invalid login or password' }), 
    function(req, res) {
    User.find({username:req.body.username, password:req.body.password}, function(err){
    if(err){ throw err; }
    else{
        req.user = new User({username:req.body.username, password:req.body.password});
        //console.log("Nombre del que tiene la sesion: " + req.session.user.username);
    }
    res.redirect('/myacc');        
    });
});
*/
// ===================================================================================================================
// ROUTER GET LOGOUT / WORKING 
router.get('/logout', function(req, res) {
    req.logout();
    //req.session.user = undefined;
    res.redirect('/');
});

// ===================================================================================================================
// ROUTER GET / POST NEW GAME , IT'S WORKING. :)))))))
router.get('/newgame', function(req,res){  
    var p1 = new Player("Miguel");
    var p2 = new Player("Invitado");
    g = new Game(p1,p2); 
    console.log("Nombre p1: " + p1.name);
    console.log("Nombre p2: " + p2.name);
    console.log("Game currentHand: " + g.currentHand);
    //res.render('play', { g : g, player1: p1, player2:p2, currentHand: p2, currentTurn:p1});    
    res.redirect('/play');
});

// ===================================================================================================================

router.get('/play', function(req, res){        
    g.newRound();
    g.currentRound.deal();
    res.render('play', { g : g })
});

router.post('/play', function(req, res){
    g.play(g.currentRound.currentTurn, req.body.action, req.body.value);
    if(g.score[0] >= 30){
        res.send("Ganaste mono culiao 1:");
    }
    else if(g.score[1] >= 30){
       res.send("Ganaste mono culiao 2:"); 
    }else{
        if(g.currentRound.auxWin == true){
            g.newRound();
            g.currentRound.deal();
        }
        res.render('play', { g : g }); 
    }
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






