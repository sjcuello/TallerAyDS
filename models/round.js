/*
 *
 * Represents a game's round
 *
 * @param game [Object]: game where the round belongs
 *
 */


// Here we are importing card model, later we will use it to create a Deck
var _ = require('lodash');
var StateMachine = require("../node_modules/javascript-state-machine/state-machine.js");
var deckModel = require("./deck");
var cardModel = require('./card');
var Deck  = deckModel.deck;
var Card = cardModel.card;

function newTrucoFSM(){
  var fsm = StateMachine.create({
  initial: 'init',
  events: [
  	// Modifiqué maquina de estados a playcard, primer-carta, played-card.
  	// Modifiqué y agregué también los retruco, valecuatro.
    { name: 'playcard',  from: 'init',                           to: 'primer-carta' },
    { name: 'envido',    from: ['init', 'primer-carta'],         to: 'envido' },
    { name: 'truco',     from: ['init', 'played-card'],          to: 'truco'  },
    { name: 'playcard',  from: ['quiero', 'no-quiero',
                                'primer-carta', 'played-card'],  to: 'played-card' },
	{ name: 'playcard2', from: ['init','quiero', 'no-quiero',
                                'primer-carta', 'played-card'],  to: 'played-card' },                                
    { name: 'quiero',    from: ['envido', 'truco',
    							'retruco','valecuatro'],         to: 'quiero'  },
    { name: 'no-quiero', from: ['envido', 'truco',
    							'retruco','valecuatro'],         to: 'no-quiero' },
    { name: 'retruco', 	 from: ['truco',], 						 to: 'retruco' },
    { name: 'valecuatro',from: ['retruco'],						 to: 'valecuatro'}
  ]});
  return fsm;
  //console.log(fsm.truco);
}

function Round(game,turn){
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
  this.score = [0,0];
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
 * player to play is who start to chant (cantar).
 *
 * ToDo
 */
Round.prototype.changeTurn = function()
{

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
Round.prototype.calculateScore = function(action,prev,value)
{
	if(action == "playcard2"){
		//var card = new Card (this.returnNumber(value),this.returnSuit(value));
		this.confrontScore();
		//console.log(card);
	}
	if((action == "quiero" || action == "no-quiero") && prev == "envido"){        			
		this.calculateScoreEnvido(action);		    
	}
	// Tengo dudas en la condición por el hecho que se puede cantar truco en cualquier turno
	// del juego.
	if((action == "quiero" || action == "no-quiero") && prev == "truco"){        			
		this.calculateScoreTruco(action,value);		    
	}
	return this.score;
}

Round.prototype.confrontScore = function(){
	//console.log(this.card.confront(card));	
	var i = 0;
	while(i< this.game.player1.cards.length){
		carta1 = this.game.player1.cards[i];
		carta2 = this.game.player1.cards[i];
		i++;
	}
	return carta1.confront(carta2);
	console.log(carta1.confront(carta2));
}

Round.prototype.calculateScoreEnvido = function(action)
{
	var pointsEnvidoP1 = this.game.player1.envidoPoints;
	var pointsEnvidoP2 = this.game.player2.envidoPoints;
	var currentHand = this.game.currentHand;
	if (action == "quiero"){
		if (pointsEnvidoP1 > pointsEnvidoP2){
			this.score = [2,0];
		}
		if (pointsEnvidoP2 > pointsEnvidoP1){
			this.score = [0,2];
		}
		if (pointsEnvidoP1 == pointsEnvidoP2 && currentHand == 'player1'){
			this.score = [2,0];
		}
		if (pointsEnvidoP1 == pointsEnvidoP2 && currentHand == 'player2'){
			this.score = [0,2];
		}
	}
	if (action == "no-quiero"){
		if (currentHand == 'player1'){
			this.score = [0,1];
		}
		if (currentHand == 'player2'){
			this.score = [1,0];
		}
	}
	this.game.score[0] += this.score[0];
	this.game.score[1] += this.score[1];
}

Round.prototype.calculateScoreTruco = function (action,value)
{
	//var card = new Card (this.returnNumber(value),this.returnSuit(value));
	//console.log(card);
	var currentHand = this.game.currentHand;
	// Este es el caso que si quiere enfrentarse.
	if(action == 'quiero'){

	}
	if (action == "no-quiero"){
		if (currentHand == 'player1'){
			this.score = [0,1];
		}
		if (currentHand == 'player2'){
			this.score = [1,0];
		}
	}	
	this.game.score[0] += this.score[0];
	this.game.score[1] += this.score[1];	
}

Round.prototype.returnSuit = function(value)
{
	var s = _.last(_.split(value, '-'));
  	return s;
}

Round.prototype.returnNumber = function(value)
{
	var n = _.head(_.split(value, '-'));
  	return n;	
}

Round.prototype.returnValueComplete = function(value)
{
	return this.returnNumber(value).concat(this.returnSuit(value));
}

Round.prototype.actionCurrent = function ()
{
	return this.fsm.current;
}

Round.prototype.actionPrevious = function ()
{
	var actionPrevious = this.fsm.current;
	return actionPrevious;
}

/*
 * Let's Play :)
 */
Round.prototype.play = function(action, value)
{
  	// save the last state 
  	var prev = this.actionPrevious(); 
  	// move to the next state  
  	this.fsm[action]();
 	// check if is needed sum score
  	this.calculateScore(action,prev,value);
  	// Change player's turn
  	return this.changeTurn();
};

module.exports.round = Round;
