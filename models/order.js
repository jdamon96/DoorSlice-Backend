var mongoose = require('mongoose');
var AddressSchema = require('./address.js').schema;
var UserSchema = require('./user.js')

var OrderSchema = new mongoose.Schema({
	cheese: {
		type: Number
	},

	pepperoni: {
		type: Number
	},

	price: {
		type: Number,
		required: true
	},

	orderDate: {
		type: Date,
		default: Date.now
	},

	Address: [AddressSchema],

	orderedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},

	cardUsed: {
		type: String,
		required: true
	},

	stars: {
		type: Number
	},

	review: {
		type: String
	}
});

module.exports = mongoose.model('Order', OrderSchema);