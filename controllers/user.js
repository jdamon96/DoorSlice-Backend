var User = require('../models/user.js');
var jwt = require("jsonwebtoken");
var passport = require('passport');
var config = require('../config/main');
var twilio = require ('twilio')(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

// Endpoint for /api/users for POSTS
exports.postUsers = function (req, res){
	if (!req.body.phone || !req.body.password || !req.body.school){
		res.json({success: false, message: 'Please include a phone number, password, and school to register.'});
	} else {
		var newUser = new User({
			phone: req.body.phone,
			password: req.body.password,
			school: req.body.school
		});

		// Attempt to save the new users
		newUser.save(function (err, user){
			if (err){
				console.log(err);
				res.json({success: false, message: "That phone number already has been used."});
			} else {
				res.json({success: true, message: "Successfully created new user.", userID: user.id});
			}
		});
	}
};

exports.login = function (req, res){

	User.findOne({
	    phone: req.body.phone
	  }, function(err, user) {
	    if (err) throw err;

	    if (!user) {
	      res.send({success: false, message: 'No user found with that phone number.'});
	    } else {
	      // Check if password matches
	      user.comparePassword(req.body.password, function(err, isMatch) {
	        if (isMatch && !err) {
	    		var token = jwt.sign(user, config.secret);
	        	res.json({ success: true, 'User Profile': user, "Last Order": user.orders[0], "JWT": "JWT " + token});
	        } else {
	          res.send({ success: false, message: 'Password failed'});
	        }
	      });
	    }
	  });

};

// Method: adds an email to the user's user profile
// Preconditions: have a variable in the body of the request called 'userEmail'
// Postconditions: if there is an error an error will be returned
	// on success, the user's profile will be returned
exports.addEmail = function (req, res){

	User.findById(req.params.user_id, function (err, user){
		if (err){
			res.send(err);
		} else {

			user.email = req.body.email;

			user.save(function (err, user){
				if (err){
					res.send(err);
				}
			});

			res.json({'User Object': user});
		}
	});

};


// Method: change the user's saved preference of whether they would like receipts on their orders or nah
// Preconditions: have a boolean variable in the body of the request called 'wantsReceipts'
// Postconditions: returns JSON w/ "User Receipt Preference" and the boolean that is assigned to that on the user's
// profile after this method has been executed.
exports.wantsReceipts = function (req, res){

	User.findById(req.params.user_id, function (err, user){
		if (err){
			res.send(err);
		} else {
			user.wantsReceipts = req.body.wantsReceipts;

			user.save(function (err, user){
				if (err){
					res.send(err);
				}
			});

			res.json({'User Receipt Preference': user.wantsReceipts});
		}
	});

};

exports.wantsConfirmation = function (req, res){

	User.findById(req.params.user_id, function (err, user){
		if (err){
			res.send(err);
		} else {

			user.wantsConfirmation = req.body.wantsConfirmation;

			user.save(function (err, user){
				if (err){
					res.send(err);
				}
			});

			res.json({'User Confirmation Preference': user.wantsConfirmation});
		}
	});

};

exports.hasSeenTutorial = function (req, res){

	User.findById(req.params.user_id, function (err, user){
		if (err){
			res.send(err);
		} else {

			user.hasSeenTutorial = req.body.hasSeenTutorial;//

			user.save(function (err, user){
				if (err){
					res.send(err);
				}
			});

			res.json({'User Tutorial Status': user.hasSeenTutorial});
		}
	});

};


exports.sendCode = function (req, res){

	var code = Math.floor(Math.random() * 899999 + 100000);

	User.findOne({
		phone: req.body.phone
	}, function(err, user){
		if (user){
			res.json({success: false, message: "That phone number is already in use!"});
		} else {

			res.json({success: true, message: code});

			twilio.sendMessage({
				to: req.body.phone,
				from: config.TWILIO_PHONE,
				body: "Doorslice Verification Code: " + code
			}, function (err, data){
				if (err){
					res.send(err);
				}
				res.send(data);
			});
		}
	});

};

exports.sendPassCode = function (req, res){

	var code = Math.floor(Math.random() * 899999 + 100000);

	User.findOne({
		phone: req.body.phone
	}, function (err, user){
		if (err){
			res.send(err);
		} else {
			if (!user){

				res.json({success: false, message: "There was no user found with that phone number"});

			} else {	

				user.passwordResetCode = code;

				user.save(function (err, user){
					if (err){
						res.send(err);
					}
				});

				twilio.sendMessage({
					to: req.body.phone,
					from: config.TWILIO_PHONE,
					body: "Doorslice Password Reset Code: " + code
				}, function (err, data){
					if (err){
						res.send(err);
					}
					res.json({success: true, 'code': code});
				});

			}
		}
		
	});

};

exports.resetPass = function (req, res){

	User.findOne({
		phone: req.body.phone
	}, function (err, user){
		if (err){
			res.send(err);
		}
		else {
			if (req.body.code == user.passwordResetCode){
				user.password = req.body.password;
				user.save(function (err, user){
					if (err){
						res.send(err);
					}
					else{
						res.json({success: true, message: "Password succesfully changed"});
					}
				});
			} else {
				res.json({success: false, message: "Code does not match"})
			}
		}
	});

};


// Endpoint for /api/users/:user_id for GET
exports.getUser = function (req, res){
	User.findById(req.params.user_id, function (err, user){
		if (err){
			res.send(err);
		}
		res.json(user);
	});
};





