var expect = require("chai").expect;
var playerModel = require("../models/player");

var Player = playerModel.player;
describe('Player', function () {
	
	describe("properties", function(){
	    it('should have a name property', function(){
	      	var p = new Player("cpu");
	      	expect(p).to.have.property('name');
	    });
	    it('should have a score property', function(){
	      	var p = new Player("human");
	      	expect(p).to.have.property('score');
	    });
	   	it('should have a id property', function(){
	    	var p = new Player("cpu");
	      	expect(p).to.have.property('id');
	    });
	});
	
	describe("#show", function(){
	    it('should returns player if be the human', function(){
	      	var p = new Player("human");
	      	expect(p.show()).to.be.eq("human");
	    });
	    it('should returns player if be the cpu', function(){
	      	var p = new Player("cpu");
	      	expect(p.show()).to.be.eq("cpu");
	    });
	});
});