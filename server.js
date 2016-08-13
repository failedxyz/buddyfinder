Error.stackTraceLimit = Infinity;

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const flash = require("connect-flash");
const http = require("http");
const mongoose = require("mongoose");
const morgan = require("morgan");
const passport = require("passport");
const session = require("express-session");
const socketIO = require("socket.io");

const common = require("./common");
const config = require("./config");
const passport_config = require("./passport_config");
const router = require("./router");

var app = express();
var server = http.Server(app);

mongoose.connect(config.db.url);
passport_config(passport);

app.use(bodyParser());
app.use(cookieParser());
app.use(express.static("public"));
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.use(session({ "secret": common.getSecret() }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

router(app, passport);

var port = process.env.PORT || 3000;
server.listen(port, "0.0.0.0", function() {
	console.log("Listening...");
});