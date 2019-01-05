
//dependencies
//dotenv
const dotenv = require('dotenv');
dotenv.config();

//express
const express = require('express');
let app = express();

//middleware
//handlebars
console.log("installing: " + "express-handlebars");
const handlebars = require("express-handlebars");
app.engine("hbs", handlebars({
  extname: "hbs",
  defaultLayout: "main",
  layoutsDir: __dirname + "/views/layouts/"
}));
app.set("views", __dirname + "/views");
app.set("view engine", "hbs");

//body-parser
console.log("installing: " + "body-parser");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

//cookie-parser
console.log("installing: " + "cookie-parser");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//express-session
console.log("installing: " + "express-session");
const expressSession = require("express-session");
if(!process.env.SESSION_SECRET) throw new Error("Then SESSION_SECRET must be defined!  More info here => https://github.com/xupertheo/webpage/wiki/express-session")
app.use(expressSession({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

//routing
const router = require('./routes/index.js');
app.use(router);

//check the public folder
app.use(express.static("public"));

//error handeling
const errorHandler = require('./preRoutes/errorHandler.js');
app.use(errorHandler);

//listening
const PORT = process.env.PORT || 80;
app.listen(PORT, function() {
  console.log("\nstarted at port: " + PORT + "\n");
});
