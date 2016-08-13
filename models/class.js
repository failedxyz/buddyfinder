var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

var classSchema = mongoose.Schema({
	"id": String,
	"day": String,
	"type": String,
	"start_time": String,
	"end_time": String,
	"location": String,
	"to_string": String
});

classSchema.methods.toString = function() {
	return this.day + " " + this.id + " " + this.start_time + " - " + this.end_time + " " + this.location;
};

module.exports = mongoose.model("Class", classSchema);