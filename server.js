const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
//var bodyParser = require("body-parser");
const express = require("express");
const app = express();

//Session handling
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: "mongodb://localhost:27017/a5",
  collection: "sessions",
});

app.use(session({ secret: "some secret here", store: store }));

app.locals.error = "";
//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());
app.use(express.urlencoded());
app.use(express.json());

//Make Server Here
app.set("view engine", "pug");

//Add Routes
let userRouter = require("./routes/user-router");
app.use("/users", userRouter);
let requestRouter = require("./routes/request-router");
app.use("/requests", requestRouter);

//Respond with home page data if requested
app.get("/", [auth, render]);

function auth(req, res, next) {
  if (req.session.loggedin) {
    res.redirect("http://localhost:3000/users");
  } else {
    next();
  }
}

function render(req, res, next) {
  //connecting to the database
  res.render("../pages/login", { error: req.app.locals.error });
  //reset any errors that got sent
  req.app.locals.error = "";
}

app.listen(3000);
console.log("Server listening at http://localhost:3000");
