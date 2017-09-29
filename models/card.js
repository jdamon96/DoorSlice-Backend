var mongoose = require('mongoose');

var CardSchema = new mongoose.Schema({

	lastFour: {
		type: String,
		required: true
	},

	cardID: {
		type: String,
		required: true
	}

});

module.exports = mongoose.model('Card', CardSchema);