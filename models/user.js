var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var AddressSchema = require('./address').schema;
var OrderSchema = require ('./order').schema;
var CardSchema = require('./card').schema;

// Define our user schema
var UserSchema = new mongoose.Schema({
	phone: {
		type: Number,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: false,
		default: "noEmail"
	},
	wantsReceipts: {
		type: Boolean,
		default: false
	},
	wantsConfirmation: {
		type: Boolean,
		default: false
	},
	hasSeenTutorial: {
		type: Boolean,
		default: false
	},
	hasStripeProfile: {
		type: Boolean,
		required: true,
		default: false
	},
	stripeCustomerID: {
		type: String
	},
	verificationCode: {
		type: Number,
		unique: false,
		required: false
	},
	passwordResetCode: {
		type: Number,
		unique: false,
		required: false
	},
	loyaltySlices: {
		type: Number,
		unique: false,
		default: 1
	},
	school: {
		type: String,
		required: true
	},
	addresses: [AddressSchema],
	orders: [OrderSchema],
	cards: [CardSchema]
});


// Execute before each user.save() call
UserSchema.pre('save', function (next) {
  var user = this;
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});


UserSchema.methods.comparePassword = function (pw, cb){
	bcrypt.compare(pw, this.password, function (err, isMatch){
		if (err){
			return cb(err);
		}
		cb(null, isMatch);
	});
};

module.exports = mongoose.model('User', UserSchema);