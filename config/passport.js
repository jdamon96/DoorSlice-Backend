var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var config = require('../config/main');

// Setup work and export for the JWT passport strategy
module.exports = function(passport) {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, function (jwt_payload, done){
    var userID = jwt_payload._doc._id;
    console.log(userID);
    User.findOne({_id: userID}, function (err, user){
      if (err) {
        console.log(err);
        return done(err, false);
      }
      if (user) {
        console.log("found user!");
        done(null, user);
      } else {
        console.log("no error nor user");
        done(null, false);
      }
    });
  }));
};