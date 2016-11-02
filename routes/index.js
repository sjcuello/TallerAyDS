var express = require('express');
var passport = require('passport');
var router = express.Router();
var _ = require('lodash');
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
            res.redirect('/lobby');
        });
    });
});

// ROUTER GET / POST REGISTER, IT'S WORKING.
router.get('/register',function(req, res) {
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
                res.redirect('/lobby');
            });
        }
    });
});

router.get('/lobby',function(req, res){
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
    res.render('win');
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
       var game = new Game ({
            player1: req.session.player, 
            player2: { nickname: "Gino",
                       _id: "580d27b0d382ab2559c033bd", 
                       envidoPoints : 0, 
                       cards : [ ], 
                       __v : 0 },
            currentHand: req.session.player.nickname,
            currentTurn:req.session.player.nickname,
            currentState: 'init',
        });
    game.deal();
    game.currentRound = game.newRound('init');
    game.transitions = game.currentRound.fsm.transitions();
    game.save(function(err,game){
        if(err){
            console.log("ERROR AL GUARDAR EL JUEGO: " + err);
        }
        req.session.game_id = game._id;
        req.session.game = game;    
        res.redirect('play');
    });
});

// ===================================================================================================================

router.get('/play', function(req, res){
    Game.findOne( { _id :req.session.game_id },function(err,gamecreate){
        if(gamecreate.currentRound.auxWin == true){
            gamecreate.deal();
            gamecreate.score = gamecreate.currentRound.score;
            gamecreate.currentState ='init';
            var round2 = gamecreate.newRound('init');
            round2.__proto__ = Round.prototype;
            round2.player1 = gamecreate.player1.nickname;  
            round2.player2 = gamecreate.player2.nickname;           
            round2.currentTurn = gamecreate.currentTurn;
            round2.currentHand = gamecreate.currentHand;
            round2.score = gamecreate.score;
            round2.turnWin = [];
            round2.tablep1 =  [];
            round2.tablep2 =  [];
            round2.flagTruco =  false;
            round2.flagNoCanto=   false;
            round2.auxWin =  false;
            round2.cartasp1 =  gamecreate.player1.cards;
            round2.cartasp2 =  gamecreate.player2.cards;  
            var  i = 0;
            var aux = false;
            while (i< 3) {
                var  j = 0;
                while (j< 3) {
                    if(round2.cartasp1[i].weight  == round2.cartasp2[j].weight){
                        aux = true;
                    }
                    j++;
                }
                i++;
            }
            gamecreate.currentRound = round2;
            gamecreate.transitions = _.uniq(gamecreate.currentRound.fsm.transitions());
            gamecreate.save(function (err,resultado){ 
                if(err){
                    console.log("ERROR AL GUARDAR DESPUES DE PLAY: " + err);
                }
                else{
                    res.render('play', { g : resultado });
                }         
            });
        }
        else{  
            res.render('play', { g : gamecreate });
        }
    }); 
});

router.post('/play', function(req, res){
    Game.findOne( { _id :req.session.game_id }, function(err,gamecurrent){    
        var round = gamecurrent.newRound(gamecurrent.currentState);
        round.__proto__ = Round.prototype;
        round.player1 = gamecurrent.player1.nickname;  
        round.player2 = gamecurrent.player2.nickname;
        round.currentTurn = gamecurrent.currentTurn;
        round.currentHand = gamecurrent.currentHand;
        round.score = gamecurrent.currentRound.score;
        round.turnWin = gamecurrent.currentRound.turnWin;
        round.tablep1 =  gamecurrent.currentRound.tablep1;
        round.tablep2 =  gamecurrent.currentRound.tablep2;
        round.flagTruco =  gamecurrent.currentRound.flagTruco;
        round.flagNoCanto=   gamecurrent.currentRound.flagNoCanto;
        round.auxWin =  gamecurrent.currentRound.auxWin;
        round.cartasp1 =  gamecurrent.currentRound.cartasp1;
        round.cartasp2 =  gamecurrent.currentRound.cartasp2;
        round.pardas =  gamecurrent.currentRound.pardas;
        gamecurrent.currentRound = round; 
        
        if(gamecurrent.currentRound.fsm.cannot(req.body.action)){
            res.redirect('notmove');  
        }
        else if(req.body.value == '' && req.body.action == 'playcard'){
            res.redirect('notmove'); 
        }else{           
            gamecurrent.currentRound = gamecurrent.play(gamecurrent.currentTurn,req.body.action,req.body.value);
            gamecurrent.transitions = _.uniq(gamecurrent.currentRound.fsm.transitions());
            console.log("El transitions corriente es: "+gamecurrent.transitions);
            var pardas = false;
            if ((gamecurrent.currentRound.turnWin[0]==-1) && (gamecurrent.currentRound.pardas == false)){
                pardas = true;
                gamecurrent.currentRound.pardas = true;
            }
            if (pardas == false){
                gamecurrent.switchPlayer();
            }
            gamecurrent.currentTurn = gamecurrent.currentHand;
            gamecurrent.score = gamecurrent.currentRound.score;
            gamecurrent.currentState = gamecurrent.currentRound.fsm.current;
            if(gamecurrent.score[0] >= 3){
                res.render('win', { g : gamecurrent });
            }
            else{
                if(gamecurrent.score[1] >= 3){
                    res.render('win', {g: gamecurrent}); 
                }else{
                    gamecurrent.save(function (err,resultado){ 
                        if(err){
                            console.log("ERROR AL GUARDAR DESPUES DE PLAY: " + err);
                        }
                        else{
                            var rAux=resultado.currentRound;
                            rAux.__proto__=Round.prototype;               
                            if(rAux.auxWin == true){
                                return res.redirect('/play');        
                            }
                            else{
                                res.render('play', { g : resultado });  
                            }   
                        }         
                    });
                }
            }
        }
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
