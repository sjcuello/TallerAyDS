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
var mongoose = require('mongoose');

var Player = playerModel.player;
var Round  = roundModel.round;
var Schema = mongoose.Schema;

/*
 * Game Schema
 */

var GameSchema = new Schema({
	name:         String,
	player1:      Object,
	player2:      Object,
	currentHand:  { type: String, default: 'player1' },
	currentTurn:  Object,
	currentRound: Object,
	rounds:       { type : Array , default : [] },
	score:        { type : Object , default : [0,0] },
});

//var Game = mongoose.model('Game', GameSchema);



function Game(player1, player2){
	/*
	 * Player 1
	 */
	this.player1 = player1;

	/*
	 * Player 2
	 */
	this.player2 = player2;

	/*
	 * sequence of previous Rounds
	 */
	this.rounds = [];

	/*
	 * Game's hand
	 */
	this.currentHand = player1;

	/*
	 * Game's hand
	 */
	this.currentRound = undefined;

	/*
	 * Game' score
	 */
	this.score = [0,0];
}
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
/*
	if(this.score[0]>=30){
		console.log("THE winner is..... PLAYER-1 !");
		return this;
	}

	if(this.score[1]>=30){
		console.log("THE winner is..... PLAYER-2 !");
		return this;
	}*/
	
	var round = new Round(this, this.currentHand);
	this.currentRound = round;
	this.currentHand = switchPlayer(this.currentHand);
	this.rounds.push(round);
	return this;
}

/*
 * returns the oposite player
 */
function switchPlayer(player) {
	return "player1" === player ? "player2" : "player1";
};

module.exports.game = Game;
