function Card(suit, number){
  this.suit=suit;
  this.number=number;
  this.weigth= weigth[this.suit][this.number];
};
module.exports.card=Card;

Card.prototype.show=function(){
  return this.number + ": " + this.suite; 


}


