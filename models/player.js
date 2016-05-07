var _ = require('lodash');

var Player = function (name) {
    this.name = name;
    this.score = 0;    
    this.id = null;
};

Player.prototype.show = function(){
  return this.name;
};


module.exports.player = Player;