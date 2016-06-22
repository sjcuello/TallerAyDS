var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var router = express.Router();

var Game = require("../models/game").game;
var Player = require("../models/player").player;
var g = undefined;
var namep1 = undefined;

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { user : req.user });
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
    }
    res.redirect('/myacc');        
    });
});
*/

// ROUTER GET / POST REGISTER, IT'S WORKING.
router.get('/register', function(req, res) {
    res.render('register', { });
});
router.post('/register', function(req, res) {
    User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
        if (err) {
            return res.render('register', { user : user });
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/myacc');
        });
    });
});

// ===================================================================================================================
// ROUTER GET / POST MYACC, WORKING.
router.get('/myacc', function(req, res){
    res.render('myacc', {user: req.user});
});

router.post('/myacc'), function(req,res) {
    res.render('myacc', { user: req.user} );
}

// ===================================================================================================================
// ROUTER GET / POST , WORKING.
router.get('/win', function(req, res){
    res.render('win', { g : g , user: req.user });
});

router.post('/win'), function(req,res) {
    res.render('win');
}

// ===================================================================================================================
// ROUTER GET LOGOUT / WORKING 
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// ===================================================================================================================
// ROUTER GET / POST NEW GAME , IT'S WORKING. :)))))))
router.get('/newgame', function(req,res){  
    var p1 = new Player(req.user.username);
    var p2 = new Player("Invitado");
    g = new Game(p1,p2);           
    res.redirect('/play');
});

// ===================================================================================================================

router.get('/play', function(req, res){
    g.newRound();
    g.currentRound.deal();
    g.newRound();
    g.currentRound.deal();
    res.render('play', { g : g })
});

router.post('/play', function(req, res){
    if(g.currentRound.fsm.cannot(req.body.action)){
        res.redirect('notmove');  
    }
    if(req.body.value == '' && req.body.action == 'playcard'){
        res.redirect('notmove'); 
    }
    g.play(g.currentRound.currentTurn, req.body.action, req.body.value);
    if(g.score[0] >= 4){
        res.redirect('win');
    }
    else if(g.score[1] >= 4){
       res.redirect('win'); 
    }else{
        if(g.currentRound.auxWin == true){
            g.newRound();
            g.currentRound.deal();
        }
        res.render('play', { g : g }); 
    }
});

router.get('/meme', function(req, res) {
    res.render('meme');
});

router.get('/notmove', function(req, res) {
    res.render('notmove');
});

module.exports = router;
// ===================================================================================================================
/*
router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});
*/

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






