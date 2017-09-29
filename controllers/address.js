var User = require('../models/user.js');
var Address = require('../models/address.js');

// Method: Adds an address to the profile of a designated user
	// Preconditions:
		// Requires in the request body 'School', 'Dorm', and 'Room'
			// These are required, an error will occur if one of these is missing
	// Postconditions:
		// If there is an error the error will be returned

exports.addAddress = function (req, res){

	User.findById(req.params.user_id, function (err, user){
		if (err){
			res.send(err);
		} else {
			if (user){
				var address = new Address({

					School: req.body.School,
					Dorm: req.body.Dorm,
					Room: req.body.Room

				});

				user.addresses.push(address);

				address.save(function (err){
					if (err){
						res.send(err);
					}
				});

				user.save(function (err){
					if (err){
						res.send(err);
					}
					res.json({'message': "Address Saved!", "Data": user.addresses[0]});
				});
			} else {
				res.json({'message': "No user found"});
			}
		}
	});

};

exports.deleteAddress = function (req, res){

	var userId = req.params.user_id;
	var addressId = req.params.address_id;

	User.update({'_id': userId}, {$pull: {"addresses": {id: addressId}}}).then(function (err, success){
		if (err){
			res.send(err);
		} else {
			res.send(success);
		}
	});

};