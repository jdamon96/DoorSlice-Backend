// Get the packages
var config = require('./config/main');
var express = require('express');
var mongoose = require ('mongoose');
var bodyParser = require('body-parser');
var twilio = require ('twilio')(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
var stripe = require("stripe")(config.STRIPE_KEY);
var jwt = require("jsonwebtoken");
var passport = require('passport');

// Loading models
var User = require('./models/user');
var Address = require('./models/address');
var Order = require('./models/order');
// Loading controllers
var userController = require('./controllers/user.js');
var paymentController = require('./controllers/payment.js');
var addressController = require('./controllers/address.js');
var orderController = require('./controllers/order.js');

// Create express application
var app = express();
// Use environment defined port
var port = process.env.PORT;
// Create express router
var router = express.Router();

// Use body-parser package in application
app.use(bodyParser.urlencoded({
	extended: true
}));
//initialize passport for use
app.use(passport.initialize());

// connect to mongoDB
mongoose.connect(config.MONGO_CONNECTION_URL);

// Bring in passport strategy
require('./config/passport')(passport);

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});


// --------------------------------------- API ROUTES -----------------------------------

router.route('/users')
	.post(userController.postUsers);

router.route('/users/login')
	.post(userController.login);

router.route('/users/addEmail/:user_id')
	.all(passport.authenticate('jwt', { session: false }))
	.post(userController.addEmail);

router.route('/users/wantsReceipts/:user_id')
	.all(passport.authenticate('jwt', { session: false }))
	.post(userController.wantsReceipts);

router.route('/users/wantsConfirmation/:user_id')
	.all(passport.authenticate('jwt', { session: false }))
	.post(userController.wantsConfirmation);

router.route('/users/hasSeenTutorial/:user_id')
	.all(passport.authenticate('jwt', { session: false }))
	.post(userController.hasSeenTutorial);

router.route('/sendCode')
	.post(userController.sendCode);


// Method: Generate and send a 6 digit code used for password reset
	// Preconditions: 
		// Needs "phone" in body of request to look up user
	// Postconditions:
		// Returns data of Twilio text sent to phone number that was
		// given IF that phone number exists for a user in the database.
		// That phone # is texted a 6 digit code that is saved to the user's profile. 
router.route('/sendPassCode')
	.post(userController.sendPassCode);

// Method: Reset Password with 6 digit code (that was texted to user in /sendPassCode method)
	// Preconditions:
		// Must use /sendPassCode method before this method so that a 6 digit code is generated and saved to user's profile
		// Needs "phone" in body of request to look up user
		// Needs "code" in body of request to compare 6 digit code input by user to the code that was assigned to the user in /sendPassCode method
		// Needs "password" in body of request to serve as the new password the user wants it reset to
	// Postconditions:
		// If the code matches the phone # then their password is changed to the password they input.
		// If there is no user w/ the phone number they input, an err is returned.
		// If the code does not match, JSON is returned saying {success: false, message: "Code does not match"}
router.route('/resetPass')
	.post(userController.resetPass);

// Method: Authenticate a user with a JWT
	// Preconditions:
		// Needs "phone" in body of request that acts as username for user profile
		// Needs "password" in body of request to authenticate user.
	// Postconditions: 
		// If the phone # does not match one in the database, JSON is returned stating {success: false, message: 'Authentication failed. User not found.'}
		// If the phone # does match a user but the password does not for that user, JSON is 
			// returned stating { success: false, message: 'Authentication failed. Passwords did not match.' }
		// If the phone # and password match a user, a JWT for that specific user is generated & JSON is returned saying { success: true, token:"JWT " + token }
router.route('/users/authenticate')
	.post(userController.authenticate);

// test authentification route.
router.get('/testauth', passport.authenticate('jwt', { session: false }), function (req, res){

 	res.json({'user id': req.user.id});

});

router.get('/isOpen/:user_id', function (req, res){

	// 8pm EST = 20
	// 4am EST = 4	

	User.findById(req.params.user_id, function (err, user){
		if (err){
			res.send(err);
		} else {
			if (user.school == "GEORGETOWN"){
				
				res.json({open: false, closedMessage: "Open Wednesday, Thursday, and Friday 10pm - 3am."});
				
			} else {
				if (user.school == "COLUMBIA"){

					res.json({open: true, closedMessage: "Open Thursday, Friday, and Saturday 10pm - 3am"});
		
				}
			}
		}
	});
});

router.get('/sendOpenText', function (req, res){

	var numbers = []
	
	for(i = 0; i < numbers.length-1; i++){
		twilio.sendMessage({
				to: numbers[i],
				from: config.TWILIO_PHONE,
				body: 'DoorSlice is now open! 10pm - 4am we are delivering fresh, hot pizza, by the slice, directly to your dorm room. Cheese: $2.99, Pepperoni: $3.49. Order now!'
			}, function (err, data){
				if (err){
					res.send(err);
				}
				res.send(data);
			});
	}	
});


// returns user's profile
router.route('/users/:user_id')
	.all(passport.authenticate('jwt', { session: false }))
	.get(userController.getUser);

// Create a new Stripe customer
router.route('/payments/newStripeUser/:user_id')
	.all(passport.authenticate('jwt', { session: false }))
	.post(paymentController.newStripeUser);

// Add a new credit card to a Stripe customer
router.route('/payments/newStripeCard/:user_id')
	.all(passport.authenticate('jwt', { session: false }))
	.post(paymentController.newStripeCard);

// Update the default credit card of a Stripe customer
router.route('/payments/updateDefaultCard/:user_id')
	.all(passport.authenticate('jwt', { session: false }))
	.post(paymentController.updateDefaultCard);

// Charge a user
router.route('/payments/charge/:user_id')
	.all(passport.authenticate('jwt', { session: false }))
	.post(paymentController.chargeUser);

// Update the default card of the user
router.route('/payments/updateDefaultCard/:user_id')
	.all(passport.authenticate('jwt', { session: false }))
	.post(paymentController.updateDefaultCard);

router.route('/payments/removeCard/:user_id')
	.all(passport.authenticate('jwt', { session: false }))
	.post(paymentController.removeCard);

// Add a new address to a user's profile
router.route('/address/:user_id')
	.all(passport.authenticate('jwt', { session: false }))
	.post(addressController.addAddress);

// Delete an address from a user's profile
router.route('/address/:user_id/:address_id')
	.all(passport.authenticate('jwt', { session: false }))
	.delete(addressController.deleteAddress);

// Method: Add an order to user's profile and order collection.
	// Preconditions:
		// Needs "cheese" in body of request .. denotes the number of cheese slices ordered *if none are ordered, set value as 0*
		// Needs "pepperoni" in body of request .. denotes the number of pepperoni slices ordered *if none are ordered, set value as 0*
		// Needs "cardUsed" in body of request ... value should be set as the cardID of the card used for payment
			// if apple pay was used, "applePay" should be set as the value
	// Postconditions:
		// if there is an error, an error will be returned
		// if there is no error, JSON will be returned with message: "Order Saved!" and return the data of the user

router.route('/orders/:user_id/:address_id')
	.all(passport.authenticate('jwt', { session: false }))
	.post(orderController.addOrder);

router.route('/rateOrder/:user_id')
	.post(orderController.rateOrder);

var pricesRoute = router.route('/prices')

pricesRoute.get(function (req, res){
	res.json({"Cheese": 3.49, "Pepperoni": 3.99});
});

var addressRoute = router.route('/addresses/:user_id')

addressRoute.get(function (req, res){

	User.findById(req.params.user_id, function (err, user){
		if (err){
			res.send(err);
		} else {
			if (!user.school){
				res.json({"Message": "This user doesn't have a school assigned to their profile"});
			}
			if (user.school == "COLUMBIA"){

				var dorms = [

				"CARMAN", "CLAREMONT4LOGAN"/*,  "WIEN HALL", 
				"48 CLAREMONT", "601 WEST 113TH STREET",
				"BROADWAY HALL", "CARLTON ARMS", 
				"EAST CAMPUS", "FURNALD HALL",
				"HARMONY HALL", "HARTLEY HALL",
				"HOGAN HALL", "RIVER HALL",
				"JUGGLES HALL", "SHAPIRO HALL", 
				"WALLACH HALL", "WATT HALL", 
				"WOODBRIDGE HALL"*/

				]
				
				res.json({"Dorms": dorms});

			} else {
				if (user.school == "GEORGETOWN"){

					var dorms = [

						"NEW SOUTH"
						/*"/*VILLAGE C EAST","VILLAGE C WEST", 
					"NEW SOUTH", "KENNEDY HALL", "LXR", 
					"HARBIN HALL", "NORTH EAST HALL", 
					"COPLEY HALL", "REYNOLDS HALL", 
					"MCCARTHY HALL", "DARNALL HALL", 
					"HENLE VILLAGE", "VILLAGE A", 
					"VILLAGE B", "NEVILS", 
					"FREEDOM HALL"*/

					]

					res.json({"Dorms": dorms});

				}
			}
		}
	});
});
	

// register all routes with /api

app.use('/api', router);

// Start the server
app.listen(port);
console.log("On port: " + port);
