var User = require('../models/user.js');
var Card = require('../models/card');
var stripe = require("stripe")(config.STRIPE_KEY);
var twilio = require ('twilio')(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

exports.newStripeUser = function (req, res){

	var stripeToken = req.body.stripeToken;

	var lastFour = req.body.lastFour;

	var userPhone;

	User.findById(req.params.user_id, function (err, user){
		userPhone = user.phone;
	});

	var customerIdHolder;

	// creates the new user's Stripe account, without a source credit card bc I do that separtley so I can return credit card ID 
	stripe.customers.create({
		description: userPhone
	}).then(function (customer){

		customerIdHolder = customer.id;

		User.findById(req.params.user_id, function (err, user){

			if (err){
				res.send(err);
			} else {

				/*console.log(user);
				console.log(customerIdHolder);*/

				user.stripeCustomerID = customerIdHolder;
				user.hasStripeProfile = true;

				user.save(function (err){
					if (err){
						res.send(err);
					} 
				});
			}

		});

			/* add their source credit card (original one they create) to the Stripe account we just made,
		then return the card ID so Oliver can store it in the front end (thats why i made it two
		separate functions, easiest way I could figure out how to get access to card object so I can return ID of it.) */

		stripe.customers.createSource(customerIdHolder, {source: stripeToken}, function (err, card){

  			var credCard = new Card({
  				lastFour: req.body.lastFour,
  				cardID: card.id
  			});

  			User.findById(req.params.user_id, function (err, user){
  				user.cards.push(credCard);
  				user.save(function (err){
  					if (err){
  						res.json({message: "Failed saving user"});
  					}
  				});
  			});
    		res.json({"card": credCard});

 		});

	});

};

exports.newStripeCard = function (req, res){

	var stripeCustomerID;
	var stripeToken = req.body.stripeToken;

	// retrieving the users Stripe customer ID so we can access their Stripe customer profile
	User.findById(req.params.user_id, function (err, user){
		if (err){
			res.send(err);
		} else {

			stripeCustomerID = user.stripeCustomerID;

		}
		// adding a new source (credit card) to the user's customer profile

		stripe.customers.createSource(
  			stripeCustomerID,
  			{source: stripeToken},
  			function (err, card){
  				if (err){
  					res.send(err);
  				} else {
  					var credCard = new Card({
	  					lastFour: req.body.lastFour,
	  					cardID: card.id
	  				});

	  				User.findById(req.params.user_id, function (err, user){
	  					user.cards.push(credCard);
	  					user.save(function (err){
	  						if (err){
	  							res.json({message: "Failed saving user"});
	  						}
	  					});
	  				});
	    			res.json({"card": credCard});	
  				}
 			}
		);

	});	

};

exports.updateDefaultCard = function (req, res){

	var stripeCustomerID;
	var cardID = req.body.cardID;

	// retrieving the users Stripe customer ID so we can access their Stripe customer profile
	User.findById(req.params.user_id, function (err, user){
		if (err){
			res.send(err);
		} else {

			stripeCustomerID = user.stripeCustomerID;

		}

		stripe.customers.update(stripeCustomerID, {
  			default_source: cardID
		}, function (err, customer) {
  			if (err){
  				res.send(err);
  			} else {
  				res.json({'message': 'card changed', 'customer': customer});
  			}
		});

	});

};

exports.removeCard = function (req, res){

	var userId = req.params.user_id;
	var cardID = req.body.cardID;

	// go to the user
	// go to the cards array
	// find the one that matches this ID
	// change the lastFour property to 0000

	var query = {
  		'cards.cardID': cardID
	};

	User.update(query, {$set: {"cards.$.lastFour": 0000}}, { multi: false }, function (err, yay){
    	if (err){
    		res.send(err);
    	} else {
    		if (yay){
    			res.json({success: true, data: yay});
    		};
    	};
	});

};

// TAKES CUSTOMER PHONE BODY REQ
// TAKE CUSTOMER EMAIL BODY REQ
exports.chargeUser = function (req, res){

	var chargeAmount = req.body.chargeAmount;
	var chargeDescription = req.body.chargeDescription;


	User.findById(req.params.user_id, function (err, user){

		if (err){
			res.send(err);
		} else {
			if (user.wantsReceipts){ // creating a charge WITH receipt
				if (req.body.stripeToken){ // if there is a stripe token then the user is using apple pay
					User.findById(req.params.user_id, function (err, user){
						if (err){
							res.send(err);
						} else {
							console.log("charge w/ email");
							var charge = stripe.charges.create({
								amount: chargeAmount,
								currency: "usd",
								source: req.body.stripeToken,
								description: chargeDescription,
								receipt_email: user.email
							}, function (err, charge){
								if (err && err.type === 'StripeCardError') {
				  		 			res.json({'Card Declined': true});
				  				} else {
				  					res.json({'Successful Charge': charge});
				  				}
							});
						}
					});
				} else { // if there was no stripe token sent, we'll use their default credit card on their stripe profile

					User.findById(req.params.user_id, function (err, user){
						if (err){
							res.send(err);
						} else {

							stripeCustomerID = user.stripeCustomerID;
							console.log(stripeCustomerID);

							console.log("charge w/ email");

							var charge = stripe.charges.create({
					  				amount: chargeAmount,
					  				currency: "usd",
					  				customer: stripeCustomerID,
					  				description: chargeDescription,
					  				receipt_email: user.email
							}, function (err, charge) {
					  			if (err && err.type === 'StripeCardError') {
					  		 		res.json({'Card Declined': true});
					  			} else {
					  				if (err){
					  					res.send(err);
					  				} else {
					  					console.log(charge);
					  					res.json({'succesful charge': charge});
					  				}
					  			}
							});
						}
					});
				}

			} else { // Creating a charge W/O receipt
				if (req.body.stripeToken){
					User.findById(req.params.user_id, function (err, user){
						if (err){
							res.send(err);
						} else {
							console.log("charge w/o email");
							var charge = stripe.charges.create({
								amount: chargeAmount,
								currency: "usd",
								source: req.body.stripeToken,
								description: chargeDescription
							}, function (err, charge){
								if (err && err.type === 'StripeCardError') {
				  		 			res.json({'Card Declined': true});
				  				} else {
				  					res.json({'succesful charge': charge});
				  				}
							});
						}
					});
				} else { // if there was no stripe token sent, we'll use their default credit card

					User.findById(req.params.user_id, function (err, user){
						if (err){
							res.send(err);
						} else {

							stripeCustomerID = user.stripeCustomerID;

							console.log("charge w/o email");
							var charge = stripe.charges.create({
					  				amount: chargeAmount,
					  				currency: "usd",
					  				customer: stripeCustomerID,
					  				description: chargeDescription
								}, function (err, charge) {
					  				if (err && err.type === 'StripeCardError') {
					  		 			res.json({'Card Declined': true});
					  				} else {
					  					res.json({'succesful charge': charge});
					  				}
							});
						}
						
					});
				}
			}
		}
		
	});
};