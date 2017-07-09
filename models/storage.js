var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// StorageSchema
var StorageSchema = mongoose.Schema({
	email: {
		type: String,
	},
	c: {
		type: String
	},
	ix: {
		type: String
	},
	ctr: {
		type: String
	}
});

var Storage = module.exports = mongoose.model('Storage', StorageSchema);

module.exports.StorageUser = function(Storage, callback){	
	        Storage.save(callback);
}

module.exports.getStorageByEmail = function(email, callback){
	var query = {email: email};
	Storage.find(query, callback);
}

