const crypto = require("crypto");
const fs = require("fs");

module.exports.sessions = {};

module.exports.getSecret = function(secretKeyFile) {
	var secretKeyFile = secretKeyFile || ".secret_key";
	var secret;
	if (fs.existsSync(secretKeyFile)) {
		secret = fs.readFileSync(secretKeyFile, { "encoding": "utf-8" });
	} else {
		secret = crypto.randomBytes(48).toString("hex");
		fs.writeFileSync(secretKeyFile, secret);
	}
	return secret;
};