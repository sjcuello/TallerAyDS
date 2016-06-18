/*
 * Represents a player in the game
 * @param name [String]: old state to intialize the new state
 */
var config = require('../config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
//mongoose.connect("mongodb://localhost/truco-development");

var password_validation = {
	validator: function(p){
		return this.password_confirmation == p;
	},
	message: "Las password no coinciden."
}
/*
 * User Schema
 */
var UserSchema = new Schema({
	username: { type: String, required: true, unique: true },
	password: String
	/*password: { type:String, 
			minlength:[3,"Password demasiado corta."],
			validate: password_validation }*/
});


UserSchema.virtual("password_confirmation").get(function(){
	return this.p_c;

}).set(function(password){
	this.p_c = password;
});
UserSchema.methods.validPassword = function( password ) {
    return ( this.password === password );
};

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
