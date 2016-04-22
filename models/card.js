function Card(suit,number){
	this.suit = suit;
	this.number = number;
	//this.weigth = weigth[this.suit][this.number]
	Card.prototype.show = function(first_argument) {
		return this.number + ":" + this.suite;
	}
};

module.exports.card = Card;