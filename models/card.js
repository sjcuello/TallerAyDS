function Card(suit,number){
	this.suit = suit;
	this.number = number;
	//this.weigth = weigth[this.suit][this.number]
	Card.prototype.show = function(suit,number) {
		return this.number + ":" + this.suit;
	}
};

module.exports.card = Card;