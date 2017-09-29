var mongoose = require('mongoose');

var AddressSchema = new mongoose.Schema({
	
	School: {
		type: String,
		required: true
	},

	Dorm: {
		type: String,
		required: true
	},

	Room: {
		type: String,
		required: true
	}

});

module.exports = mongoose.model('Address', AddressSchema);