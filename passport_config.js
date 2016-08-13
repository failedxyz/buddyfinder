var FacebookStrategy = require("passport-facebook").Strategy;
var User = require("./models/user");

var configAuth = require("./config");
module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});
	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	passport.use(new FacebookStrategy({
		"clientID": configAuth.facebook.clientID,
		"clientSecret": configAuth.facebook.clientSecret,
		"callbackURL": configAuth.facebook.callbackURL,
		"profileFields": ["email", "displayName"]
	}, function(token, refreshToken, profile, done) {
		process.nextTick(function() {
			console.log(profile);
			User.findOne({ "facebook.id": profile.id }, function(err, user) {
				if (err) return done(err);
				if (user) {
					return done(null, user);
				} else {
					var newUser = new User();
					newUser.facebook.id = profile.id;
					newUser.facebook.token = token;
					newUser.facebook.name = profile.displayName;
					newUser.facebook.email = profile.emails[0].value;
					newUser.save(function(err) {
						if (err) throw err;
						return done(null, newUser);
					});
				}
			});
		})
	}));
};