require("dotenv").config({silent: true});

module.exports = {
	"db": {
		"url": process.env.DB_URL
	},
	"facebook": {
		"clientID": process.env.CLIENT_ID,
		"clientSecret": process.env.CLIENT_SECRET,
		"callbackURL": process.env.CALLBACK_URL
	}
};