var Class = require("./models/class");
var User = require("./models/user");

function escape(str) {
    return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

module.exports = function(app, passport) {
	app.get("/", function(req, res, next) {
		if (req.isAuthenticated()) {
			res.render("index", { "user": req.user });
		} else {
			res.render("index", { "user": null, "message": req.flash("authMessage") });
		}
	});

	app.get("/auth", passport.authenticate("facebook", {
		"scope": "email"
	}));

	app.get("/auth/callback", passport.authenticate("facebook", {
		"successRedirect": "/",
		"failureRedirect": "/"
	}));

	app.post("/", function(req, res, next) {
		if (!req.isAuthenticated()) return res.render("index", { user: null });
		if (!req.body.id) return res.render("index", { user: req.user, error: "Please add a class ID" });
		if (!req.body.day) return res.render("index", { user: req.user, error: "Please add a day of week" });
		if (!req.body.start_time) return res.render("index", { user: req.user, error: "Please add a start time" });
		if (!req.body.end_time) return res.render("index", { user: req.user, error: "Please add a end time" });
		if (!req.body.location) return res.render("index", { user: req.user, error: "Please add a location" });

		var c;
		(function(callback) {
			Class.findOne({ id: req.body.cid }, function(err, c) {
				if (c)
					return callback(c);
				else {
					var newClass = new Class();
					newClass.id = req.body.id;
					newClass.day = req.body.day;
					newClass.start_time = req.body.start_time;
					newClass.end_time = req.body.end_time;
					newClass.location = req.body.location;
					newClass.to_string = newClass.toString();
					newClass.save(function(err, hei) {
						return callback(newClass);
					});
				}
			});
		})(function(_class) {
			var currentUser = User.findById(req.user.id, function(err, user) {
				if (user.classList.indexOf(_class.id) >= 0) return res.render("index", { user: req.user, error: "You already have this class added." });
				console.log({ "facebook.id": req.user.facebook.id }, { $push: { classList: _class.id } });
				User.update({ "facebook.id": req.user.facebook.id }, { $push: { classList: _class.id } }, function(err) {
					res.render("index", { user: req.user, message: "Success!" });
				});
			});
		});
	});

	app.post("/search", function(req, res, next) {
		if (!req.body.words) return res.send([]);
		var search = new RegExp(".*(" + req.body.words.split(" ").map(function(str) {
			return escape(str).replace(/\\/g, "\\\\");
		}).join("|") + ").*", "gi");
		console.log(search);
		Class.find({ "to_string": search }, function(err, documents) {
			return res.send(documents);
		});
	});

	app.get("/logout", function(req, res, next) {
		req.logout();
		res.redirect("/");
	});
};