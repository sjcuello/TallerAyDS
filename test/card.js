var expect = require ("chai").expect;
var cardModel = require('../models/card.js');

var Card = cardModel.card;

describe("Card", function(){
	it ("Should have a suit", function(){
		var c = new Card(1,"oro");
		expect(c).to.have.property("suit");
	});

	describe ("#Show", function(){
		it ("Should show the card", function(){
			var c = new Card ("Copa",4);
			expect(c.show()).to.equal("4:Copa");
		});
	});
});