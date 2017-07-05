var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// RegisterSchema
var RegisterSchema = mongoose.Schema({
	email: {
		type: String,
	},
	xd: {
		type: String
	},
	gr1: {
		type: String
	},
	gr2: {
		type: String
	},
	cpi:{
		type: String
	},
	kd:{
		type: String
	},
	mkd:{
		type: String
	}
});

var Register = module.exports = mongoose.model('Register', RegisterSchema);

module.exports.RegisterUser = function(Register, callback){	
	        Register.save(callback);
}

module.exports.ResetUser = function(Register, callback){	
			Register.isNew = false;
	        Register.save(callback);
}

module.exports.getRegisterByEmail = function(email, callback){
	var query = {email: email};
	Register.findOne(query, callback);
}

