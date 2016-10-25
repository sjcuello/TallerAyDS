/*
 * Represents a player in the game
 * @param name [String]: old state to intialize the new state
 */
var config = require('../config');
var mongoose = require('mongoose'); // OK
var Schema = mongoose.Schema; // OK 
var passportLocalMongoose = require('passport-local-mongoose');
//mongoose.connect("mongodb://localhost/truco-development");

/*
 * User Schema
 */
var UserSchema = new Schema({
	username: { type: String, 
		required: true, 
		unique: true },
	password: String
	/*password: { type:String, 
			minlength:[3,"Password demasiado corta."],
			validate: password_validation }
	*/
});


var password_validation = {
	validator: function(p){
		return this.password_confirmation == p;
	},
	message: "Las password no coinciden."
}

UserSchema.virtual("password_confirmation").get(function(){
	return this.p_c;

}).set(function(password){
	this.p_c = password;
});

UserSchema.methods.validPassword = function( pass ) {
    return ( this.password === pass );
};

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
