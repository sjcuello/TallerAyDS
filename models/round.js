//---------------------------------------------------------------------------------------------
var _ = require('lodash');
var StateMachine = require("../node_modules/javascript-state-machine/state-machine.js");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deckModel = require("./deck");
var cardModel = require("./card");
var playerModel = require("./player");
var gameModel = require("./game");
var Game = gameModel.game;
var Deck  = deckModel.deck;
var Card = cardModel.card;
var Player = playerModel.player;
var cartasp1 = [];
var cartasp2 = [];
var turnWin = [];                 //lista con el ganador de cada turno
var tablep1 = [];                 //cartas jugadas j1
var tablep2 = [];                 //cartas jugadas j2
var flagTruco = false;            //flagTruco canto truco
var flagNoCanto = false;          //flagTruco para partidos sin cantar truco
var auxWin = false;               //ganador del truco  
//----------------------------------------------------------------------------------------


//----------------------------------------------------------------------------------------
Round.prototype.newTrucoFSM=function(estadoInic){
  var initialState = estadoInic || 'init'; 

    var fsm = StateMachine.create({
    initial: initialState,
    events: [

      { name: 'playcard',  from: 'init',                           to: 'primer-carta' },
    
      { name: 'envido',    from: ['init', 'primer-carta'],         to: 'envido' },

      { name: 'mazo',      from: ['init', 'primer-carta','envido',
                                  'played-card','playcard',
                                  'quiero','no-quiero'],           to: 'mazo' },
    
      { name: 'truco',     from: ['init', 'played-card',
                                  'playcard','primer-carta',
                                  'quiero','no-quiero'],           to: 'truco'  },

      { name: 'playcard',  from: ['quiero', 'no-quiero',
                                  'primer-carta', 'played-card',
                                  'envido', 'truco'],             to: 'played-card' },   

      { name: 'quiero',    from: ['envido', 'truco'],             to: 'quiero'  },

      { name: 'no-quiero', from: ['envido', 'truco'],             to: 'no-quiero' },
    ]});

    return fsm;
  }

//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
function Round(game, turn){
  this.player1 = game.player1.nickname;  
  
  //this.player1.__proto__ = Player.prototype;

  this.player2 = game.player2.nickname;

  //this.player2.__proto__ = Player.prototype;  

  //this.game = game;

  this.currentHand = game.currentHand;

  this.currentTurn = game.currentTurn;

  //this.currentTurn = turn;
 
  this.fsm = this.newTrucoFSM(game.currentState);

  this.status = 'running';

 // this.score = [0,0];

  this.score = game.score;

  this.turnWin = [];

  this.tablep1 = [];

  this.tablep2 = [];

  this.flagTruco =  false;

  this.flagNoCanto=  false;

  this.auxWin = false;

  this.cartasp1 = game.player1.cards;

  this.cartasp2 = game.player2.cards;

  this.pointsEnvidoP1 = game.player1.envidoPoints;

  this.pointsEnvidoP2 = game.player2.envidoPoints;


}
//----------------------------------------------------------------------------------
/*
Round.prototype.imprime= function(){
  console.log("-----------TRAE EL METODO-----------------------");
};
*/
//-----------------------------------------------------------------------------------
/*
Round.prototype.deal = function(){
  var deck = new Deck().mix();
  this.cartasp1 = (_.pullAt(deck, 0, 2, 4));
  this.cartasp2 = (_.pullAt(deck, 1, 3, 5));
};*/
//----------------------------------------------------------------------------------



//------------------------------------------------------------------------------------
Round.prototype.switchPlayer=function (player) {
  /*console.log("el player de switchPlayer  de ronda 1");
  console.log(this.player1);
  console.log("el player de switchPlayer  de ronda 2");
  console.log(this.player2);
  console.log("el player de switchPlayer ");
  console.log(player);*/

  return this.player1 === player ? this.player2 : this.player1;
};
//-----------------------------------------------------------------------------------

//------------------------------------------------------------------------------------
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
  Round.prototype.confrontScore = function(tablep1,tablep2){  

    switch(_.size(this.turnWin)){
      case 0:
        if(this.tablep1[0]!=undefined && this.tablep2[0]!=undefined){
          var card1 = this.tablep1[0];
          card1.__proto__ = Card.prototype;
          var card2 = this.tablep2[0];
          card2.__proto__ = Card.prototype;
          var conf = card1.confront(card2);
          this.selectWin(conf);                  
        }
        break;
      case 1:
        if(this.tablep1[1]!=undefined && this.tablep2[1]!=undefined){
          var card1 = this.tablep1[1];
          card1.__proto__ = Card.prototype;
          var card2 = this.tablep2[1];
          card2.__proto__ = Card.prototype;
          var conf = card1.confront(card2);
          this.selectWin(conf);                  
        }
        break;
      case 2:
        if(this.tablep1[2]!=undefined && this.tablep2[2]!=undefined){
          var card1 = this.tablep1[2];
          card1.__proto__ = Card.prototype;
          var card2 = this.tablep2[2];
          card2.__proto__ = Card.prototype;
          var conf = card1.confront(card2);
          this.selectWin(conf);                  
        }
    }
    return this;
}
//------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------
Round.prototype.selectWin= function(conf){
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
Round.prototype.changeTurn = function(){

  if((_.size(this.tablep1)!=_.size(this.tablep2))||(this.fsm.current == 'truco')){

   return this.currentTurn = this.switchPlayer(this.currentTurn);
  }

  if(_.size(this.turnWin)!=0){//el que gana sigue jugando

    switch(_.last(this.turnWin)){
      case 0:
        return this.currentTurn = this.player1;
        break;
      case 1:
        return this.currentTurn = this.player2;
        break;
      case -1:
        return this.currentTurn = this.currentHand;
        break;
    }
  }
  return this.currentTurn = this.switchPlayer(this.currentTurn);

}
//-----------------------------------------------------------------------



//----------------------------------------------------------------------
Round.prototype.calculateScore = function(game,action,prev,value,player){

  console.log("el player en calculateScore es: "+ player);
  //cuando se tira una carta
  if (((action == "played-card")||(action == "playcard"))&&(this.auxWin==false)){
                                    
    this.setTable(value,player);//cargo la carta corespondiente al jugador

    //si puedo. confronto las cartas y cargo ganador del enfrentamiento
    this.confrontScore(tablep1,tablep2);

    //si se canto truco y tengo almenos 4 cartas en mesa busco ganador
    if((this.flagTruco==true) && (_.size(this.tablep1)>1) && (_.size(this.tablep2)>1)) { 

       this.calculateScoreTruco(action,player); 
    } 

    //en el caso que no se canto nada le sumo uno al ganador
    if((this.flagTruco==false) &&  (this.flagNoCanto==false) && (_.size(this.tablep1)>1) && (_.size(this.tablep2)>1)) { 

      console.log("no se canto nada");

       var p1 = this.score[0]; 
       var p2 = this.score[1]; 

       this.calculateScoreTruco(action,player); 

     } 


  }

  //cuando se canta mazo
  if((action == "mazo") && (this.flagTruco==false) ){   
    
    if  ((_.size(this.tablep1)>0) && (_.size(this.tablep2)>0)) {
       this.auxWin=true;   
       if (player == this.player1){ this.score[1]+=1; }
       if (player == this.player2){ this.score[0]+=1; }
    }else{
       if (player == this.player1){ this.score[1]+=2; }
       if (player == this.player2){ this.score[0]+=2; }
       this.auxWin=true;   
    }
  }



  //cuando se canta envido
  if((action == "quiero" || action == "no-quiero") && prev == "envido"){              
    this.calculateScoreEnvido(action);        
  }

  //cuando se canta truco
  if((action == "quiero" || action == "no-quiero") && prev == "truco"){  

    if(action == "quiero")    //si se acepta se activa la flagTruco
        this.flagTruco = true; 
    if((_.size(this.tablep1) <2)||(_.size(this.tablep2) <2)) //si hay 4  o mas cartas en la mesa
        this.calculateScoreTruco(action,player,value);
     
    
  }

      return this;
}     
//------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------
Round.prototype.calculateScoreEnvido = function(action){

  if (action == "quiero"){
    if (this.pointsEnvidoP1 > this.pointsEnvidoP2){ this.score[0]+=2; }
    if (this.pointsEnvidoP2 > this.pointsEnvidoP1){ this.score[1]+=2; }
    if (this.pointsEnvidoP1 == this.pointsEnvidoP2 && this.currentHand == this.player1){ this.score[0] +=2; }
    if (this.pointsEnvidoP1 == this.pointsEnvidoP2 && this.currentHand == this.player2){ this.score[1] +=2; }
  }

  if (action == "no-quiero"){
    if (this.currentHand == this.player1){ this.score[0] += 1; }
    if (this.currentHand == this.player2){ this.score[1] += 1; }
  }
}
//------------------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------------------
Round.prototype.checkWinner =function(arr, num){
  
  var i=0; 
  while(i<_.size(arr) && this.auxWin==false){
   var elem=arr[i];
   if (( this.distHamming(elem,this.turnWin))==0){
     this.auxWin=true;

      if (this.flagTruco == true){
        this.score[num]+=2;
      }else{
        this.score[num]+=1;
        this.flagNoCanto =true;
      }
      
      console.log("************ gano "+ num + "************"); 
     }  
   i++;
   }
}
//-------------------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------------------
Round.prototype.calculateScoreTruco = function (action,player,value){ 
  
  if((action == "quiero"||action == "playcard")&&(this.auxWin==false)){

    //  0 cooresponde jugador 1  
    //  1 corresponde al jugador 2   
    //  -1 corresponde al empate
    
    //posibilodades ganar player1
    var fst= [[0,0],[-1,0],[1,0,0],[0,-1],[-1,-1,0],[0,1,0],[0,1,-1]];
    //posibilodades ganar player2  
    var snd = [[1,1],[-1,1],[0,1,1],[1,-1],[-1,-1,1],[1,0,1],[1,0,-1]];
    //posibilidad de triple empate  
    var ch= [-1,-1,-1];

    if((this.distHamming(ch,this.turnWin))==0){

      //en caso de triple empate le sumo 2 al jugador mano
      if(this.player1 == this.currentHand){ 
        this.score[0]+=2; 
      }else{
        this.score[1]+=2; 
      }
      this.auxWin=true; 

    }else{         
        this.checkWinner(fst,0);//chequeo si gana jugador 1 
        this.checkWinner(snd,1);//chequeo si gana jugador 2
    }
  } 

  if (action == "no-quiero"){

       this.auxWin=true;   
       if (player == this.player1){ this.score[1]+=1; }
       if (player == this.player2){ this.score[0]+=1; }
  }

}
//------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------
  Round.prototype.setTable = function(value,player){
    console.log("entro al setTable");
    console.log("++++++++++el value de setTable es: "+value);
    var encontrado = false;
    console.log("player es: "+ player);
      if(player == this.player1){
      console.log("player1 es: "+ player);
      var card = new Card (this.returnNumber(value),this.returnSuit(value));
      //console.log("la carta creada: "+card.show() );
      console.log("las cartasp1: "+cartasp1);
        var aux = undefined;
        var i = 0;
        while (i < _.size(this.cartasp1)){
          
          if(this.cartasp1[i].number == card.number && this.cartasp1[i].suit == card.suit){
            
            aux = i;
            encontrado = true;
            this.tablep1.push(card);     
            console.log("el tablep1: " + tablep1);   
          }
          i++;
        }
        console.log("posicion de la carta " + aux);

        if(aux!=undefined){ 
          _.pullAt(this.cartasp1, [aux]);
          console.log("cartasp1: "+ this.cartasp1);
        }
      }      
      if(player == this.player2){
        console.log("player2 es:" + player);
        var card = new Card (this.returnNumber(value),this.returnSuit(value));
        var aux = undefined;
        var i = 0;
        while (i < _.size(this.cartasp2)){
          if(this.cartasp2[i].number == card.number && this.cartasp2[i].suit == card.suit){
            aux = i;
            encontrado=true;
            this.tablep2.push(card);            
          }
          i++;
        }

        console.log("posicion de la carta " + aux);
        if(aux!=undefined){
          _.pullAt(this.cartasp2, [aux]);
          console.log("cartasp2: "+ cartasp2);
        }
      }


      
  }  
//------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------
Round.prototype.reset =function() {

  this.auxWin=false; 
  this.flagTruco=false;
  this.score[0]=0;
  this.score[1]=0;
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
Round.prototype.play = function(game,player,action, value){
    // save the last state 
    var prev = this.actionPrevious(); 

    console.log("el previo es " + prev );

    console.log("el player en ronda es: "+player);
    // move to the next state  
    this.fsm[action]();
    // check if is needed sum score
    this.calculateScore(game,action,prev,value,player);
   
    this.changeTurn();




    return this;
};

module.exports.round = Round;
//------------------------------------------------------------------------------------------
