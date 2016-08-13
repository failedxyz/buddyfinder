var Class = require("./models/class");
var User = require("./models/user");

function escape(str) {
    return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

function updateCount(user, callback) {
	User.find({}, function(err, users) {
		(function next(i) {
			if (i == user.classList.length) {
				callback(user);
			} else {
				var id = user.classList[i].id;
				var members = [];
				for (var j=0; j<users.length; j++) {
					if (users[j].classList.map(function(item) {return item.id;}).indexOf(id) >= 0) {
						members.push({
							name: users[j].facebook.name,
							id: users[j].facebook.id
						});
					}
				}
				user.classList[i].members = members;
				next(i + 1);
			}
		})(0);
	});
}

module.exports = function(app, passport) {
	app.get("/", function(req, res, next) {
		if (req.isAuthenticated()) {
			updateCount(req.user, function(user) {
				res.render("index", { "user": user, "message": req.flash("message") });
			});
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

		var c;
		(function(callback) {
			Class.findOne({ id: $in: [req.body.cid, req.body.id] }, function(err, c) {
				if (c)
					return callback(c);
				else {
					if (!req.body.id) return res.render("index", { user: req.user, error: "Please add a class ID" });
					if (!req.body.day) return res.render("index", { user: req.user, error: "Please add a day of week" });
					if (!req.body.start_time) return res.render("index", { user: req.user, error: "Please add a start time" });
					if (!req.body.end_time) return res.render("index", { user: req.user, error: "Please add a end time" });
					if (!req.body.location) return res.render("index", { user: req.user, error: "Please add a location" });
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
				if (user.classList.map(function(item) { return item.id; }).indexOf(_class.id) >= 0) return res.render("index", { user: req.user, error: "You already have this class added." });
				delete _class._id;
				delete _class.__v;
				User.update({ "facebook.id": req.user.facebook.id }, { $push: { classList: _class } }, function(err) {
					req.flash("message", "Success!");
					res.redirect("/");
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