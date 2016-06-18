/*
 *
 * Represents a game's round
 *
 * @param gmae [Object]: game where the round belongs
 *
 */
var _ = require('lodash');
var StateMachine = require("../node_modules/javascript-state-machine/state-machine.js");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deckModel = require("./deck");
var cardModel = require("./card");
var playerModel = require("./player");
var Deck  = deckModel.deck;
var Card = cardModel.card;
var Player = playerModel.player;
var turnWin = [];                 //lista con el ganador de cada turno
var tablep1 = [];                 //cartas jugadas j1
var tablep2 = [];                 //cartas jugadas j2
var bandera = false;              //bandera canto truco
var bandera2 = false;             //bandera para partidos sin cantar truco
var auxWin = false;               //ganador del truco    //falta modelar partido sin cantar nada

function newTrucoFSM(){
  var fsm = StateMachine.create({
  initial: 'init',
  events: [

    { name: 'playcard',  from: 'init',                           to: 'primer-carta' },
    { name: 'envido',    from: ['init', 'primer-carta'],         to: 'envido' },
    { name: 'truco',     from: ['init', 'played-card',
                                'playcard','primer-carta',
                                 'quiero','no-quiero'],         to: 'truco'  },
    { name: 'playcard',  from: ['quiero', 'no-quiero',
                                'primer-carta', 'played-card',
                                'envido', 'truco',
                                'retruco','valecuatro'],         to: 'played-card' },                               
    { name: 'quiero',    from: ['envido', 'truco',
                                'retruco','valecuatro'],         to: 'quiero'  },
    { name: 'no-quiero', from: ['envido', 'truco',
                                'retruco','valecuatro'],         to: 'no-quiero' },
    { name: 'retruco',   from: ['truco',],                       to: 'retruco' },
    { name: 'valecuatro',from: ['retruco'],                      to: 'valecuatro'}
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

  this.turnWin = [];

  this.tablep1 = [];

  this.tablep2 = [];

  this.bandera =  false;

  this.bandera2=  false;

  this.auxWin = false;
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
//------------------------------------------------------------------------------------
Round.prototype.changeTurn = function(){

  if((_.size(this.tablep1)!=_.size(this.tablep2))||(this.fsm.current == 'truco')){

   return this.currentTurn = switchPlayer(this.currentTurn);
  }

  if(_.size(this.turnWin)!=0){//el que gana sigue jugando

    switch(_.last(this.turnWin)){
      case 0:
        return this.currentTurn = 'player1';
        break;
      case 1:
        return this.currentTurn = 'player2';
        break;
      case -1:
        return this.currentTurn = this.game.currentHand;
        break;
    }
  }
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
Round.prototype.calculateScore = function(action,prev,value,player){

  //cuando se tira una carta
  if (((action == "played-card")||(action == "playcard"))&&(this.auxWin==false)){
                                    
    this.setTable(value,player);//cargo la carta corespondiente al jugador

    //si puedo. confronto las cartas y cargo ganador del enfrentamiento
    this.confrontScore(tablep1,tablep2);

    //si se canto truco y tengo almenos 4 cartas en mesa busco ganador
    if((this.bandera==true) && (_.size(this.tablep1)>1) && (_.size(this.tablep2)>1)) { 

       //console.log("entro truco");
       this.calculateScoreTruco(action);  
              //console.log("salio truco");
    } 

    //en el caso q no se canto nada le sumo uno al ganador
    if((this.bandera==false) &&  (this.bandera2==false) && (_.size(this.tablep1)>1) && (_.size(this.tablep2)>1)) { 

      console.log("no se canto nada");

       var p1 = this.score[0]; 
       var p2 = this.score[1]; 

       //console.log("score p1 antes: "+ this.score[0]);
       //console.log("score p2 antes: "+ this.score[1]);

      this.calculateScoreTruco(action); 


      if (this.score[0] > p1 ){ 
        this.score[0] -= 1;
        this.auxWin =true;
        
        this.bandera2 =true;
      } 

      if (this.score[1] > p2 ){ 
        this.score[1] -= 1;
        this.auxWin =true;
        
        this.bandera2 =true;
      } 

      
      



       //console.log("score p1 despues: "+ this.score[0]);
       //console.log("score p2 despues: "+ this.score[1]);
       
     } 


  }

  //cuando se canta envido
  if((action == "quiero" || action == "no-quiero") && prev == "envido"){              
    this.calculateScoreEnvido(action);          
  }

  //cuando se canta truco
  if((action == "quiero" || action == "no-quiero") && prev == "truco"){  
    //si se acepta y no  hay almenos 4 cartas en la mesa se activa la bandera
    if(action == "quiero")
        this.bandera = true; 
    //sino se calculan los puntos directamente
    if((_.size(this.tablep1) <2)||(_.size(this.tablep2) <2))
        this.calculateScoreTruco(action,value);
       // return this.score;
     
    
  }

       //console.log("score p1 antesde push: "+ this.score[0]);
       //console.log("score p2 antesde push:  "+ this.score[1]);


       //console.log("score  game p1 antesde push: "+ this.game.score[0]);
       //console.log("score  game p2 antesde push:  "+ this.game.score[1]);


        //this.game.score[0] += this.score[0];
        //this.game.score[1] += this.score[1];

        //this.score[0]= 0;
        //this.score[1]= 0;

    //return this.score;
}     
//------------------------------------------------------------------------------------





//------------------------------------------------------------------------------------
Round.prototype.calculateScoreEnvido = function(action){

  var pointsEnvidoP1 = this.game.player1.envidoPoints;
  var pointsEnvidoP2 = this.game.player2.envidoPoints;
  var currentHand = this.game.currentHand;

  if (action == "quiero"){
    if (pointsEnvidoP1 > pointsEnvidoP2){ this.score[0] +=2; }
    if (pointsEnvidoP2 > pointsEnvidoP1){ this.score[1] +=2; }
    if (pointsEnvidoP1 == pointsEnvidoP2 && currentHand == 'player1'){ this.score[0] +=2; }
    if (pointsEnvidoP1 == pointsEnvidoP2 && currentHand == 'player2'){ this.score[1] +=2; }
  }

  if (action == "no-quiero"){
    if (currentHand == 'player1'){ this.score[0] += 1; }
    if (currentHand == 'player2'){ this.score[1] += 1; }
  }

  this.game.score[0] += this.score[0];
  this.game.score[1] += this.score[1];
}


Round.prototype.calculateScoreTruco = function (action,value){ 
  
  if((action == "quiero"||action == "playcard")&&(this.auxWin==false)){

    //  0 cooresponde jugador 1  //  1 corresponde al jugador 2   //  -1 corresponde al empate
    var fst= [[0,0],[-1,0],[1,0,0],[0,-1],[-1,-1,0],[0,1,0],[0,1,-1]];  //posibilodades ganar player1
    var snd = [[1,1],[-1,1],[0,1,1],[1,-1],[-1,-1,1],[1,0,1],[1,0,-1]];  //posibilodades ganar player1
    var ch= [-1,-1,-1];

    if((this.distHamming(ch,this.turnWin))==0){

      //en caso de triple empate le sumo 2 al jugador mano
      if('player1' == this.game.currentHand){ this.score[0]+=2; }
      else{ this.score[1]+=2; }
      this.auxWin=true; 

    }else{

      //console.log("score p1 antes while truco: "+ this.score[0]);
      //console.log("score p2 antes while truco: "+ this.score[1]);

       var i=0; //indice fst
       while(i<_.size(fst) && this.auxWin==false){
         var elem=fst[i];//elemento corriente
         if (( this.distHamming(elem,this.turnWin))==0){
           this.auxWin=true;    
           this.score[0]+=2; 
           console.log("************gano 1************");
         }
         i++;
       }
        
       var j=0; //indice snd
       while(j<_.size(snd) && this.auxWin==false){
          var elem=snd[j];//elemento corriente
          if (( this.distHamming(elem,this.turnWin))==0){
            this.auxWin=true;       
            this.score[1]+=2; 
            console.log("************gano 2************");
          }
          j++;


       }


    //console.log("score p1 dsp while truco: "+ this.score[0]);
    //console.log("score p2 dsp while truco: "+ this.score[1]);

    }
} 

  if (action == "no-quiero"){
    if (currentHand == 'player1'){ 
      this.score[0]+=1; 
       
    }
    if (currentHand == 'player2'){ 
      this.score[1]+=1;
       
    }
  }


  //this.game.score[0] += this.score[0];
  //this.game.score[1] += this.score[1];

  console.log("chau truco");

}
Round.prototype.returnSuit = function(value) {
  var s = _.last(_.split(value, '-'));
  return s;
}
Round.prototype.returnNumber = function(value){
  var n = _.head(_.split(value, '-'));
  return n; 
}
Round.prototype.returnValueComplete = function(value){
  return this.returnNumber(value).concat(this.returnSuit(value));
}
Round.prototype.actionCurrent = function (){
  return this.fsm.current;
}
Round.prototype.actionPrevious = function (){
  var actionPrevious = this.fsm.current;
  return actionPrevious;
}
 Round.prototype.setTable = function(value,player){
    var encontrado = false;
      if(player == 'player1'){
        var card = new Card (this.returnNumber(value),this.returnSuit(value));
        var aux = undefined;
        var i = 0;
        while (i < _.size(this.game.player1.cards)){
          if(this.game.player1.cards[i].number == card.number && this.game.player1.cards[i].suit == card.suit){
            aux = i;
            encontrado = true;
            this.tablep1.push(card);        
          }
          i++;
        }
        console.log("posicion de la carta " + aux);

        if(aux!=undefined){ 
          _.pullAt(this.game.player1.cards, [aux]);
        }
      }
      if(player == 'player2'){
        var card = new Card (this.returnNumber(value),this.returnSuit(value));
        var aux = undefined;
        var i = 0;
        while (i < _.size(this.game.player2.cards)){
          if(this.game.player2.cards[i].number == card.number && this.game.player2.cards[i].suit == card.suit){
            aux = i;
            encontrado=true;
            this.tablep2.push(card);            
          }
          i++;
        }

        console.log("posicion de la carta " + aux);
        if(aux!=undefined){
          _.pullAt(this.game.player2.cards, [aux]);
        }
      }
      
  }  

/*
//------------------------------------------------------------------------------------
  Round.prototype.setTable = function(value,player){
    var card = new Card (this.returnNumber(value),this.returnSuit(value));
      if(player == 'player1'){
        if(this.searchValideCard(player,card) == true)        
          this.tablep1.push(card);
      }
      if(player == 'player2'){
        if(this.searchValideCard(player,card) == true)       
          this.tablep2.push(card);
      }
    }
//------------------------------------------------------------------------------------
*/


//------------------------------------------------------------------------------------
  Round.prototype.confrontScore = function(tablep1,tablep2){  

    switch(_.size(this.turnWin)){
      case 0:
        if(this.tablep1[0]!=undefined && this.tablep2[0]!=undefined){
          var card1 = this.tablep1[0];
          var card2 = this.tablep2[0];
          var conf = card1.confront(card2);
          this.selectWin(conf);                  
        }
        break;
      case 1:
        if(this.tablep1[1]!=undefined && this.tablep2[1]!=undefined){
          var card1 = this.tablep1[1];
          var card2 = this.tablep2[1];
          var conf = card1.confront(card2);
          this.selectWin(conf);                  
        }
        break;
      case 2:
        if(this.tablep1[2]!=undefined && this.tablep2[2]!=undefined){
          var card1 = this.tablep1[2];
          var card2 = this.tablep2[2];
          var conf = card1.confront(card2);
          this.selectWin(conf);                  
        }
    }
    return this;
}
//------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------
Round.prototype.selectWin= function(conf){
  //console.log("turnWin inicial: "+_.toString(turnWin));
  switch(conf){
    case -1:
      return this.turnWin.push(1);
      break;
    case 0:
      return this.turnWin.push(-1);
      break;
    case 1:
      return this.turnWin.push(0);
      break;
  } 
  return this;
}
//------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------
Round.prototype.distHamming = function(arr1,arr2){
  if (_.size(arr1) != _.size(arr2)){ return -1; }
  var counter = 0;
  for (var i = 0; i < _.size(arr1); i++){ if (arr1[i] != arr2[i]){ counter++; } }
  return counter;
}
//------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------

Round.prototype.reset =function() {

  this.auxWin=false; 
  this.bandera=false;
  this.score[0]=0;
  this.score[1]=0;
  //this.turnWin=[];
  //this.tablep1=[];
  //this.tablep2=[];

  while(_.size(this.turnWin)!=0){
    this.turnWin.shift();
  }
  while(_.size(this.tablep1)!=0){
    this.tablep1.shift();
  }
  while(_.size(this.tablep2)!=0){
    this.tablep2.shift();
  }
}
//------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------
Round.prototype.play = function(player,action, value){
    // save the last state 
    var prev = this.actionPrevious(); 
    // move to the next state  
    this.fsm[action]();
    // check if is needed sum score
    this.calculateScore(action,prev,value,player);
   
    return this.changeTurn();
};

module.exports.round = Round;
