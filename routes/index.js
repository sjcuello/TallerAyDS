var express = require('express');
var passport = require('passport');
var router = express.Router();

var User = require('../models/user');
var Game = require("../models/game").game;
var Player = require("../models/player").player;
var Round = require("../models/round").round;
var Card = require("../models/card").card;
var StateMachine = require("../node_modules/javascript-state-machine/state-machine.js");

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

// ===================================================================================================================
// ROUTER GET / POST LOGIN, IT'S WORKING.
router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', function(req, res) {
    User.findOne( { username : req.body.username}, function(err, user) {
        if (user === null){
            return res.render("login", { message: 'Usuario no registrado.'});
        }
        if (user.password !== req.body.password) {
            return res.render("login", { message: 'Contraseña incorrecta.' });
        }        
        passport.authenticate('local')(req, res, function () {
            req.session.name = user.username;
            //console.log("Logueado con el nombre de: " +  req.session.name);
            res.redirect('/lobby');
        });
    });
});

// ROUTER GET / POST REGISTER, IT'S WORKING.
router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    User.register(new User({ username : req.body.username, password:req.body.password }), req.body.password, function(err, user) {
        if(err) {
            return res.render("register", { info: "Usuario ya registrado."});
        }else{
            if(err){
                return res.render("register", { info: 'Usuario o clave incorrecto.' });  
            }
            passport.authenticate('local')(req, res, function () {
                req.session.name = user.username;
                //console.log("Registrado con el nombre de: " +  req.session.name);
                res.redirect('/lobby');
            });
        }
    });
});


router.get('/lobby', function(req, res){
  Player.findOne( {nickname: req.session.name}, function (err, player) {
      if (!err) {
        if (!player) {
            var player = new Player({
                playerid : req.session.user_id,
                nickname : req.session.name,
                cards: [],
                envidoPoints: 0
            });             
        player.save(function(err) {
            req.session.player = player;
          return res.render('lobby', {});     
        });
          } else {  
            req.session.player = player;
            return res.render('lobby', {});
          }
      }
  });  
});

router.post('/lobby'), function(req,res) {  
  res.render('lobby', {});
}

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
    //Player.findOne({ nickname: req.session.name },function(err,player) {
    var game = new Game ({
            player1: req.session.player, 
            player2: { nickname: "Gino",
                       _id: "580d27b0d382ab2559c033bd", 
                       envidoPoints : 0, 
                       cards : [ ], 
                       __v : 0 },
            currentHand: req.session.player
        });
    game.save(function(err,game){
        if(err){
            console.log("ERROR AL GUARDAR EL JUEGO: " + err);
        }
        req.session.game_id = game._id;
        req.session.game = game;            
        res.redirect('play');
    });
    //});   
});

// ===================================================================================================================

router.get('/play', function(req, res){
    Game.findOne( { _id :req.session.game_id },function(err,gamecreate){
        console.log("gamecreate 1: " + gamecreate);
        console.log("Get de play: " + req.session.game_id);
        gamecreate.newRound();
        gamecreate.currentRound.deal();                              
        if(gamecreate.score[0] == 0 && gamecreate.score[1] == 0){
            gamecreate.newRound();
            gamecreate.currentRound.deal();
        }
        var round = gamecreate.currentRound;
        round.__proto__ = Round.prototype;
        console.log("gamecreate 2: " + gamecreate); 
        /*Game.update({overwrite: true,new: true, upsert: true, setDefaultsOnInsert: true}, function (err){   
            if(err){
                console.log(err);
            }else{
                console.log("Se ha updateado todo, en teoría.");
                res.render('play', { g : gamecreate });
            }
        });*/
        /*
        gamecreate.save(function(err){
            if(err){
                console.log(err);
            }
            res.render('play', { g : gamecreate });
        });*/
        res.render('play', { g : gamecreate });
    });
});

router.post('/play', function(req, res){
    Game.findOne( { _id :req.session.game_id }, function(err,gamecurrent){                                                                                                        
        console.log("Post de play: " + req.session.game_id);
        console.log("gamecurrent:" + gamecurrent);
        //gamecurrent.getRound();
        //var round = gamecurrent.currentRound;
        //round.__proto__ = Round.prototype;      
        if(round.fsm.cannot(req.body.action)){
            res.redirect('notmove');  
        }
        if(req.body.value == '' && req.body.action == 'playcard'){
            res.redirect('notmove'); 
        }
        gamecurrent.play(round.currentTurn, req.body.action, req.body.value);
        if(gamecurrent.score[0] >= 30){
            res.redirect('win');
        }
        else if(gamecurrent.score[1] >= 30){
            res.redirect('win'); 
        }
        else{
            if(round.auxWin == true){
                gamecurrent.update({ _id :req.session.game_id }, 
                            { $set : {score : gamecurrent.score, currentRound: gamecurrent.currentRound} },
                            /*{upsert:true,safe:true,multi: true},*/
                            function (err,resultado){   
                    return res.redirect('/play');
                });
            }
        }
        res.render('play', { g : gamecurrent });            
    });
});

router.get('/meme', function(req, res) {
    res.render('meme');
});

router.get('/notmove', function(req, res) {
    res.render('notmove');
});

module.exports = router;

// ===================================================================================================================
