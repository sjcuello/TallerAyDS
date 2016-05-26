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
var cardModel = require("./card");
var Card = cardModel.card;
var Deck  = deckModel.deck;
var cardTable = []; //cartas jugadas
var turnWin = [-1,-1,-1]; //ganador por turno
var tmpWin = 0; ////hace referencia a la posicion(turno) que falta cargar 

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

  this.cardTable = cardTable;
  /*
   * next turn
   */
  this.currentTurn = turn;

  this.turnWin = turnWin;

  /*
   * here is a FSM to perform user's actions
   */
  this.fsm = newTrucoFSM();

  /*
   *
   */
	this.tmpWin = tmpWin;

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
    //siempre ejecuta las 2
    //this.calculateScoreEnvido(action);
    this.calculateScoreTruco(action);
    this.game.score[0] += this.score[0];
    this.game.score[1] += this.score[1];
  }

  return this.score;
}


Round.prototype.calculateScoreTruco = function(action){

 if(action == "truco"){
   //realizar una funcion para que jugador elija una carta
   	if(this.game.player1 == this.game.currentHand){
   		var i = 0;
   		var c1 = 0;
   		while(this.cardTable[i] != null){
   			c1++;
   			i+=2;
   		}
  		this.cardTable[i] = this.game.player1.cards[c1];
  	}else{
  		var j = 1;
  		var c2 = 0;
   		while(this.cardTable[i] != null){
   			c2++;
   			i+=2;
   		}
  		this.cardTable[j] = this.game.player2.cards[c2];
  	}
  }
  
  if((action == "quiero")){

  	var x1;
  	var x2;

  	switch(tmpWin){
  		case 0 : x1=0; x2=1; break;
  		case 1 : x1=2; x2=3; break;
  		case 2 : x1=4; x2=5; break;
  	} 

    var c = new Card(1, 'espada');
    var x = new Card(4, 'basto');
  	//var card1 = this.cardTable[x1];
  	//var card2 = this.cardTable[x2];
  	var conf = c.confront(x);

  	//var conf = cardTable[x1].confront(this.cardTable[x2]);
  	switch(conf){
  		case -1 :turnWin[tmpWin]=1; tmpWin++; break;
  		case 0 : tmpWin++; break;
  		case 1 : turnWin[tmpWin]=0; tmpWin++; break;
  	}

  	if(tmpWin==3){
  		var w=0; 
  		var count0=0;//cantidad de turnos ganados de jugador 1
  		var count1=0;//cantidad de turnos ganados de jugador 2
  	  while(w<tmpWin){
	  	if(turnWin[w]==0){count0++;}
	  	if(turnWin[w]==1){count1++;}
	  	w++;
  	  }
  	  if(count0>count1){
  	  	this.score[0]+=2;
  	  }else{
  	  	this.score[1]+=2;
  	  }
  	}

  }

  var ch = undefined; 
  // La var ch tiene la mano corriente.
  if(this.game.player1 == this.game.currentHand){ 
    ch = 0;
  }else{
    ch = 1;
  }

  if(action == "no-quiero"){
	ch = (ch*(-1))+1// Obtengo el jugador opuesto a la mano corriente. 
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

   if(action == "play card"){
   //realizar una funcion para que jugador elija una carta
   	if(this.game.player1 == this.game.currentHand){
  		this.cardTable[0] = this.game.player1.cards[0];
  	}else{
  		this.cardTable[1] = this.game.player2.cards[0];
  	}
  }
  
  if((action == "quiero") && (this.cardTable[0]==null)||(this.cardTable[1]==null)){
    if(pj1 > pj2){ this.score[0] += 2; }

    if(pj1 < pj2){ this.score[1] += 2; }

    if(pj1 == pj2){ this.score[ch] += 2; }
  }

  if(action == "no-quiero"){
 //if(this.cardTable.isLength(0)){
  	  if((this.cardTable[0]== null)   &&  (this.cardTable[1]== null)){
      	ch = (ch*(-1))+1// Obtengo el jugador opuesto a la mano corriente. 
      }
      this.score[ch] += 1 ;
  }
  return this.score;
};

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
