var expect= require("chai").expect;
var model= require("../models/card");
var Card= cardModel.card;
describe ("Card",function(){
  if("Should have a suit",function (){
    var c = new Card(1,"oro");
    expect(c).to.have.propety("suit");  
  })
  describe("#Show", function(){
    if ("Should show the card",function(){
      var c=new Card(4, "copa");
      expect(c.show()).to.be.equal("4: copa");
      })
    })
    
  
});