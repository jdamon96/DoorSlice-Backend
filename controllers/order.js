var User = require('../models/user.js');
var Address = require('../models/address.js');
var Order = require('../models/order.js');
var twilio = require ('twilio')(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

exports.addOrder = function (req, res){

	User.findById(req.params.user_id, function (err, user){
		if (err){
			res.send(err);
		}

		var saveOrder;

		var textData;

		var addressString;
		
		var customerPhone = user.phone;

		Address.findById(req.params.address_id, function (err, address){
			if (err){
				res.send(err);
			} else {

				addressString = "School: " + address.School + " Dorm: " + address.Dorm + " Room: " + address.Room;

				saveOrder = new Order({
					cheese: req.body.cheese,
					pepperoni: req.body.pepperoni,
					price: req.body.price,
					orderDate: Date.now(),
					Address: address,
					orderedBy: req.params.user_id,
					cardUsed: req.body.cardUsed
				});
			};

			textData = "Cheese: " + req.body.cheese + " Pepperoni: " +req.body.pepperoni + " Price: " +  req.body.price + " Address: " +  addressString;

			// push the order to the User's array of orders
	 		user.orders.push(saveOrder);

			// resave the user w/ his updated array of orders
			user.save(function (err){
				if (err){
					console.log('ERROR ON USER SAVE');
					console.log(err);
					res.send(err);
				}
				res.json({'message': "Order Saved!", "Data": user});
			});

			// save the order in the collection of orders
			saveOrder.save(function (err){
				if (err){
					console.log("ERROR ON ORDER SAVE");
					console.log(err);
					res.send(err);
				}
			});



			// -------- send the text to deliverers -----------

			var sendNumber = [];

			if (user.school == "GEORGETOWN"){
				sendNumber = [config.GEORGETOWN_DELIVERER_NUMBER];
				
			} else {
				if (user.school == "COLUMBIA"){
					sendNumber = [config.COLUMBIA_DELIVERER_NUMBER];
				}
			};



			for(i = 0; i < sendNumber.length; i++){
				twilio.sendMessage({
					to: sendNumber[i],
					from: config.TWILIO_PHONE, 
					body: 'New Order: ' + textData + ' Customer Phone: ' + customerPhone
				}, function (err, data){
					if (err){
						res.send(err);
					}
					res.send(data);
				});
			}

		});
	
	});

}

exports.rateOrder = function (req, res){

	User.findById(req.params.user_id, function (err, user){
		var my_array = user.orders;
		var last_order = my_array[my_array.length - 1];

		last_order.stars = req.body.stars;

		if (req.body.review){
			last_order.review = req.body.review;
		};

		user.save(function (err){
			if (err){
				res.send(err);
			}
		});

		res.json({'last order': last_order});

	});

}