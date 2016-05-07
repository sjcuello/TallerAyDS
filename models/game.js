var _ = require('lodash');
var roundModel = require('./round');//don't forget create file 'round.js'
var playerModel = require('./player');// to relate to 'player.js'
var deckModel= require('./deck');//                        

var amountSession=0;//refers to number of sessions finishied

function Game(){
  this.Players = [];
}
  Game.prototype.numberOfSessions=function(roundModel){
    if (this.finishied)//for each round, if finishied return true
      ++amountSession;
  };
  
  Game.prototype.addPlayer = function (playerModel) {
    this.Players.push(playerModel);
    playerModel.id = this.Players.length;
    return this;
  };
        
  var newGame = new Game();


};

module.exports.game = Game;                            




