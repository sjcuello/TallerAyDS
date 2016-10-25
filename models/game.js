/*
 *
 * Represents a game
 * @param player1 [String]: name of player 1
 * @param player2 [String]: name of player 2
 *
 */

var _ = require('lodash');
var playerModel = require("./player");
var roundModel = require("./round");
var deckModel = require('./deck');
var cardModel = require('./card');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Player = playerModel.player;
var Round  = roundModel.round;


/*
 * Game Schema
 */

var GameSchema = new Schema({
	//name:         String,
	player1:      Object,
	player2:      Object,
	currentHand:  Object,
	currentTurn:  Object,
	currentRound: Object,
	//currentRound: Object,
	rounds:       { type : Array , default : [ ] },
	score:        { type : Array , default : [0,0] },
});

var Game = mongoose.model('Game', GameSchema);

/*
 * Check if it's valid move and play in the current round
 */

Game.prototype.play = function(player, action, value){	
	if(value == '' && action == 'playcard')
		throw new Error("[ERROR] INVALID PLAY...");

	if(this.currentRound.currentTurn !== player  || (this.currentRound.currentTurn == player && this.currentRound.auxWin==true))   
		throw new Error("[ERROR] INVALID TURN...");

	if(this.currentRound.fsm.cannot(action))
		throw new Error("[ERROR] INVALID MOVE...");
				
	return this.currentRound.play(player,action, value);
};

/*
 * Create and return a new Round to this game
 */
Game.prototype.newRound = function(){
	var round = new Round(this, this.currentHand);
	this.currentRound = round;
	this.currentHand = switchPlayer(this.currentHand);
	this.rounds.push(round);
	//.log(this.rounds.shift());
	return round;
}

Game.prototype.getRound = function(){	
	//var round = this.currentRound;
	var round = this.rounds.pop();
	return round;
}

/*
 * returns the oposite player
 */
function switchPlayer(player) {
	return "player1" === player ? "player2" : "player1";
};
//module.exports = mongoose.model('Game', GameSchema);
module.exports.game = Game;
