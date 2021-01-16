const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
let User = require("./../models/UserModel");
let Request = require("./../models/RequestModel");
let Card = require("./../models/CardModel");

mongoose.connect("mongodb://localhost:27017/a5", { useNewUrlParser: true });
let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Mongo in Req");
});

//Setting up the routes
let router = express.Router();

router.get("/", getRequests);

router.post("/", createRequest);
router.post("/:rid", verifyRequest);

//Function to process a request sent by the user
function verifyRequest(req, res) {
  //Check if the user is accepting or denying
  if (req.body.accept) {
    //Find the request in the database
    Request.findOne({ _id: req.body.id }, function (err, result) {
      if (err) throw err;
      //If there is a result, continue to process the request
      if (result) {
        if (result.type == "friend") {
          //Find the user in the database
          let senderId = result.sender;
          let recieverId = result.recipient;
          User.findOne({ username: senderId }, function (err, result) {
            if (err) throw err;
            //Add the user as a new friend
            result.friends.push(recieverId);
            result.save(function (err) {
              if (err) throw err;
            });
          });
          //Add the other user to the other friend list
          User.findOne({ username: recieverId }, function (err, result) {
            if (err) throw err;

            result.friends.push(senderId);
            result.save(function (err) {
              if (err) throw err;
            });
          });

          //Removing the request object
          Request.deleteOne({ _id: req.body.id }, function (err) {
            if (err) throw err;
          });
          res.send();
        } else {
          //Processing the trade request
          let offer = [];
          let ret = [];
          let sender = result.sender;
          let reciever = result.recipient;
          let counter = 0;
          //Get the cards sent
          for (let i = 0; i < result.offer.length; i++) {
            Card.findOne({ name: result.offer[i] }, function (err, card) {
              if (err) throw err;
              if (card) {
                offer.push(card);
                counter++;
              }
              if (counter == result.offer.length) {
                //If all the cards offered have been found, continue
                counter = 0;
                for (let i = 0; i < result.return.length; i++) {
                  Card.findOne({ name: result.return[i] }, function (
                    err,
                    card
                  ) {
                    if (err) throw err;
                    if (card) {
                      counter++;
                      ret.push(card);
                    }
                    if (counter == result.return.length) {
                      //Check that both users still have the cards
                      User.findOne(
                        { username: sender, cards: { $in: offer } },
                        function (err, sendUser) {
                          if (err) throw err;
                          if (sendUser) {
                            User.findOne(
                              { username: reciever, cards: { $in: ret } },
                              function (err, recUser) {
                                if (err) throw err;
                                console.log(recUser);
                                if (recUser) {
                                  //At this point, all cards have been found, and are owned by the appropriate users
                                  //Swap the cards
                                  User.update(
                                    { username: reciever },
                                    { $pull: { cards: { $in: ret } } },
                                    { multi: true },
                                    function (err, result) {
                                      if (err) throw err;
                                      console.log(result);
                                    }
                                  );
                                  User.update(
                                    { username: sender },
                                    { $pull: { cards: { $in: offer } } },
                                    { multi: true },
                                    function (err, result) {
                                      if (err) throw err;
                                      console.log(result);
                                    }
                                  );
                                  User.update(
                                    { username: reciever },
                                    { $push: { cards: offer } },
                                    { multi: true },
                                    function (err, result) {
                                      if (err) throw err;
                                      console.log(result);
                                    }
                                  );
                                  User.update(
                                    { username: sender },
                                    { $push: { cards: ret } },
                                    { multi: true },
                                    function (err, result) {
                                      if (err) throw err;
                                      console.log(result);
                                    }
                                  );
                                  //Send good response
                                  res.status(200).send();
                                } else {
                                  res.status(204).send();
                                }
                              }
                            );
                          } else {
                            res.status(204).send();
                          }
                        }
                      );
                    }
                  });
                }
              }
            });
          }
          //Removing this object regardless of the outcome since a failed trade should not be kept
          Request.deleteOne({ _id: req.body.id }, function (err) {
            if (err) throw err;
          });
        }
      }
    });
  } else {
    Request.deleteOne({ _id: req.body.id }, function (err) {
      if (err) throw err;
    });
    res.send();
  }
}
function createRequest(req, res, next) {
  if (req.body.type == "friend") {
    //Find username attributed to this session
    User.findOne({ _id: req.session.uid }, function (err, result) {
      if (err) throw err;

      //Create new friend request and save it to the database
      let newRequest = new Request({
        sender: result.username,
        recipient: req.body.recipient,
        type: "friend",
      });

      newRequest.save(function (err) {
        if (err) throw err;
        res.status(200).send();
      });
    });
  } else if (req.body.type == "trade") {
    //Find the user attributed with this session
    User.findOne({ _id: req.session.uid }, function (err, result) {
      if (err) throw err;
      //Make a new trade request
      let newRequest = new Request({
        sender: result.username,
        recipient: req.body.recipient,
        type: "trade",
        offer: req.body.offer,
        return: req.body.return,
      });

      newRequest.save(function (err) {
        if (err) throw err;
        console.log("Trade Request Submitted");
        res.status(200).send();
      });
    });
  } else {
    res.status(204).send();
  }
}

function getRequests(req, res, next) {
  //Responds with all the outstanding requests back to the user
  User.findOne({ _id: req.session.uid }, function (err, result) {
    Request.find({ recipient: result.username }, function (err, result) {
      if (result.length == 0) {
        res.status(204).send();
      } else {
        res.send(result);
      }
    });
  });
}

module.exports = router;
