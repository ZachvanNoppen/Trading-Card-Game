const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
let User = require("./../models/UserModel");
let Cards = require("./../models/CardModel");

mongoose.connect("mongodb://localhost:27017/a5", { useNewUrlParser: true });
let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to mongoDB");
});

let router = express.Router();

//Requests
//router.get("/:id", [getUser, renderPage]);
router.post("/", [loginAuth, loginHandler]);

router.get("/", [auth, renderPage]);
router.get("/add", getUsers);
router.get("/logout", [auth, logout]);

function logout(req, res, next) {
  req.session.destroy(function (err) {
    if (err) throw err;
    res.send();
    console.log("Logging out");
  });
}

function getUsers(req, res, next) {
  let name = req.query.query;
  //Making sure that spaces are excluded
  if (name.trim() == "") {
    res.status(204);
    res.send();
  } else {
    //Finding users that contain the specified string
    User.find(
      {
        username: { $regex: name, $options: "i" },
        _id: { $ne: req.session.uid },
        friends: { $nin: req.session.uid },
      },
      function (err, result) {
        if (err) throw err;
        if (result.length == 0) {
          res.status(204).send();
        } else {
          res.send(result);
        }
      }
    );
  }
}

function loginAuth(req, res, next) {
  //Checking if the user is logged in
  if (req.session.loggedin) {
    //This should really be a 401. After everything works
    //I will change it
    req.app.locals.error =
      "Another user is currently logged in... Log out and try again.";
    res.redirect("http://localhost:3000/");
  } else {
    next();
  }
}
function auth(req, res, next) {
  //Checking if the user is logged in
  if (req.session.loggedin) {
    next();
    //This should really be a 401. After everything works
    //I will change it
  } else {
    req.app.locals.error = "Session Expired. Please Login";
    res.redirect("http://localhost:3000/");
  }
}
function loginHandler(req, res, next) {
  //let name = req.username;
  // let password = req.pword;

  //Checking if the user has registered, or is trying to log in
  if (req.body.register) {
    //Registering the user

    //Search the DB for the user
    User.find({ username: req.body.username }, function (err, result) {
      if (err) throw err;

      //if there is no user, add it to the db
      if (result.length == 0) {
        createNewUser(req, res);
        //Make a new user
      } else {
        req.app.locals.error = "There is already a user with that name";
        res.redirect("http://localhost:3000/");
      }
    });
    //Add the new user to the db
  } else if (req.body.login) {
    //check for the user

    //Search the DB for the user
    User.find(
      { username: req.body.username, password: req.body.password },
      function (err, result) {
        if (err) throw err;

        //if there is no user, add it to the db
        if (result.length == 0) {
          req.app.locals.error = "Invalid username or password";
          res.redirect("http://localhost:3000/");
        } else {
          let user = result[0].toObject();
          //Set the session
          req.session.loggedin = true;
          req.session.uid = user._id;
          //Find friend data and return it to the page
          let friendList = [];
          let count = 0;
          if (user.friends.length == 0) {
            res.render("../pages/index", {
              name: user.username,
              cards: user.cards,
              friends: [],
            });
          } else {
            user.friends.forEach((fId) => {
              User.findOne({ username: fId }, function (err, result) {
                if (err) throw err;
                friendList.push({ name: result.username, cards: result.cards });
                count++;

                if (count == user.friends.length) {
                  res.render("../pages/index", {
                    name: user.username,
                    cards: user.cards,
                    friends: friendList,
                  });
                }
              });
            });
          }
        }
      }
    );
  }
}

function createNewUser(req, res) {
  let startingCards = [];
  // Get the count of all users
  Cards.countDocuments().exec(function (err, numDocuments) {
    // Get a random entry

    // Again query all users but only fetch one offset by our random #
    let found = 0;
    for (let i = 0; i < 10; i++) {
      var random = Math.floor(Math.random() * numDocuments);
      Cards.findOne()
        .skip(random)
        .exec(function (err, result) {
          if (err) throw err;
          //PUtting the card id in the user array
          let card = result.toObject();
          startingCards.push(card);
          found++;
          //After all the cards have been found, save the user
          if (found == 10) {
            let newUser = new User({
              username: req.body.username,
              password: req.body.password,
              cards: startingCards,
              friends: [],
            });

            newUser.save(function (err) {
              if (err) throw err;

              //Setting the session to go with the user
              req.session.loggedin = true;
              req.session.uid = newUser._id;
              //Sending the response back to the user after the save is complete
              res.render("../pages/index", {
                name: newUser.username,
                cards: newUser.cards,
                friends: newUser.friends,
              });
            });
          }
        });
    }
  });
}

function renderPage(req, res, next) {
  //get the user from the session
  User.find({ _id: req.session.uid }, function (err, result) {
    if (err) throw err;
    let user = result[0].toObject();
    //let cards;
    //Generating an array of all the cards
    //Now that there is a user, we need to find the information on each friend
    let friendList = [];
    let count = 0;
    if (user.friends.length == 0) {
      res.render("../pages/index", {
        name: user.username,
        cards: user.cards,
        friends: friendList,
      });
    } else {
      user.friends.forEach((fId) => {
        User.findOne({ username: fId }, function (err, result) {
          if (err) throw err;
          friendList.push({ name: result.username, cards: result.cards });
          count++;

          if (count == user.friends.length) {
            res.render("../pages/index", {
              name: user.username,
              cards: user.cards,
              friends: friendList,
            });
          }
        });
      });
    }
  });
}

module.exports = router;
