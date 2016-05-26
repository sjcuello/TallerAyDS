/*
 *
 * Represents a game's round
 *
 * @param gmae [Object]: game where the round belongs
 *
 */

var _ = require('lodash');
var StateMachine = require("../node_modules/javascript-state-machine/state-machine.js");
var deckModel = require("./deck");
var Deck  = deckModel.deck;

function newTrucoFSM(){
  var fsm = StateMachine.create({
  initial: 'init',
  events: [
    { name: 'play card', from: 'init',                           to: 'primer carta' },
    { name: 'envido',    from: ['init', 'primer carta'],         to: 'envido' },
    { name: 'truco',     from: ['init', 'played card'],          to: 'truco'  },
    { name: 'play card', from: ['quiero', 'no-quiero',
                                'primer carta', 'played card'],  to: 'played card' },
    { name: 'quiero',    from: ['envido', 'truco'],              to: 'quiero'  },
    { name: 'no-quiero', from: ['envido', 'truco'],              to: 'no-quiero' },
  ]});

  return fsm;
}


function Round(game, turn){
  /*
   * Game
   */
  this.game = game;

  /*
   * next turn
   */
  this.currentTurn = turn;

  /*
   * here is a FSM to perform user's actions
   */
  this.fsm = newTrucoFSM();

  /*
   *
   */
  this.status = 'running';

  /*
   * Round' score
   */
  this.score = [0, 0];
}


/*
 * Generate a new deck mixed and gives to players the correspondent cards
 */
Round.prototype.deal = function(){
  var deck = new Deck().mix();

  this.game.player1.setCards(_.pullAt(deck, 0, 2, 4));
  this.game.player2.setCards(_.pullAt(deck, 1, 3, 5));
};

/*
 * Calculates who is the next player to play.
 *
 * + if action is 'quiero' or 'no-quiero' and it's playing 'envido' the next
 * player to play is who start to chant
 *
 * + if action is 'quiero' or 'no-quiero' and it's playing 'envido' the next
 * player to play is who start to chant
 *
 * ToDo
 */
Round.prototype.changeTurn = function(){
   return this.currentTurn = switchPlayer(this.currentTurn);
}

/*
 * returns the oposite player
 */
function switchPlayer(player) {
  return "player1" === player ? "player2" : "player1";
};

/*
 * ToDo: Calculate the real score
 */
Round.prototype.calculateScore = function(action){
  if(action == "quiero" || action == "no-quiero" || action == "play card"){
    //this.score = [0, 2];
    this.calculateScoreEnvido(action);
    //this.calculateScoreTruco(action);
    this.game.score[0] += this.score[0];
    this.game.score[1] += this.score[1];
  }

  return this.score;
}


Round.prototype.calculateScoreTruco = function(action){
  var cj1 = this.game.player1.cards() ;
  var cj2 = this.game.player2.cards() ;
  var ch = undefined; 
  // La var ch tiene la mano corriente.
  if(this.game.player1 == this.game.currentHand){ 
    ch = 0;
  }else{
    ch = 1;
  }

  if(action == "no-quiero"){
      // Obtengo el jugador opuesto a la mano corriente. 
      ch = (ch*(-1))+1
      this.score[ch] += 1 ;
  }
  return this.score;
}

Round.prototype.calculateScoreEnvido = function(action){
  // Asignamos los puntos de jugadores de envido.
  var pj1 = this.game.player1.points() ;
  var pj2 = this.game.player2.points() ;
  var ch = undefined; 
  // La var ch tiene la mano corriente.
  if(this.game.player1 == this.game.currentHand){ 
    ch = 0;
  }else{
    ch = 1;
  }
  
  if(action == "quiero"){

    if(pj1 > pj2){ this.score[0] += 2; }

    if(pj1 < pj2){ this.score[1] += 2; }

    if(pj1 == pj2){ this.score[ch] += 2; }
  }

  if(action == "no-quiero"){
      // Obtengo el jugador opuesto a la mano corriente. 
      ch = (ch*(-1))+1
      this.score[ch] += 1 ;
  }
  return this.score;
}

/*
 * Let's Play :)
 */
Round.prototype.play = function(action, value) {
  // move to the next state
  this.fsm[action]();

  // check if is needed sum score
  this.calculateScore(action);

  // Change player's turn
  return this.changeTurn();
};

module.exports.round = Round;
