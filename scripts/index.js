//Adding event handlers
document.getElementById("searchInput").addEventListener("keyup", findFriend);
//Arrays that hold the number of requests in the queue, and the IDs of those that have already been viewed
var viewedReq = [];
let count = [0, 0];
//Poll the page every 3 seconds
poll();
setInterval(function () {
  //Polling every 3 seconds
  poll();
}, 3000);

function poll() {
  //poll() checks the page every 3 seconds for new requests and adds the data to the page
  //This only deals with trade and friend notifications
  //card and friend data can be updated by reloading the page
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let badge, field;
      //For each request that is outstanding
      this.response.forEach((req) => {
        //Check if the request has been published to the page already
        if (!viewedReq.includes(req._id)) {
          //Add the request to the list of recieved requests
          viewedReq.push(req._id);
          //Check the request type
          if (req.type == "friend") {
            badge = document.getElementById("numFriends");
            field = document.getElementById("fRequests");

            //Update the html content, even if it is not showing currently
            field.innerHTML +=
              "<div class=' container row justify-content-between mt-2'>" +
              "<p>" +
              req.sender +
              " wants to be your friend!</p>" +
              "<button value=" +
              req._id +
              " class='btn btn-primary' onclick='respondRequest(event,true)'> Accept </button>" +
              "<button value=" +
              req._id +
              " class='btn btn-danger' onclick='respondRequest(event,false)'> Deny </button>" +
              "</div>";
            //Update the number of requests that have come in
            count[0]++;
            badge.innerHTML = count[0];
          } else if (req.type == "trade") {
            badge = document.getElementById("numTrades");
            field = document.getElementById("tRequests");
            count[1]++;
            //Generating trade information to display in the modal
            let offerSection = "";
            let returnSection = "";
            for (let i = 0; i < req.offer.length; i++) {
              offerSection += "<p>" + req.offer[i] + "</p>";
            }
            for (let i = 0; i < req.return.length; i++) {
              returnSection += "<p>" + req.return[i] + "</p>";
            }
            //Setting up the popup modal to view the trade
            field.innerHTML +=
              '<div class="container row justify-content-between mt-2"><p>Trade from ' +
              req.sender +
              '</p><button type="button" class="btn btn-primary" data-toggle="modal' +
              "" +
              '" data-target="#' +
              req._id +
              '"> View </button></div>' +
              '<div class="modal fade" id="' +
              req._id +
              '" tabindex="-1" role="dialog" aria-labelledby="modalLabel' +
              count[1] +
              '" aria-hidden="true">' +
              '<div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header">' +
              '<h5 class="modal-title" id="modalLabel' +
              count[1] +
              '">Modal title</h5>' +
              '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
              '<span aria-hidden="true">&times;</span></button></div>' +
              '<div class="modal-body row">' +
              '<div class="container w-50"><h6>They offer:</h2>' +
              offerSection +
              "</div>" +
              '<div class="container w-50"><h6>For your:</h2>' +
              returnSection +
              "</div>" +
              '</div><div class="modal-footer">' +
              '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>' +
              '<button value="' +
              req._id +
              '"type="button" class="btn btn-primary" data-dismiss="modal" onclick="respondTrade(event, true)">Accept</button>' +
              '<button value="' +
              req._id +
              '" type="button" class="btn btn-danger" data-dismiss="modal" onclick="respondTrade(event, false)">Deny</button>' +
              "</div></div></div></div>";

            //Update number of requests
            badge.innerHTML = count[1];
          }
        }
      });
    } else if (this.status == 204) {
      console.log("There are no new items");
    }
  };
  xhttp.open("GET", "/requests", true);
  xhttp.responseType = "json";
  xhttp.send(null);
}
function clearCards(event) {
  let allCards = document.getElementsByClassName("customCheckbox");
  for (let i = 0; i < allCards.length; i++) {
    if (allCards[i].checked) {
      if (allCards[i].name == "recieve") {
        allCards[i].checked = false;
        //The label is what gets updated visually so we clear that.
        parent = allCards[i].parentNode;
        parent.classList.remove("rounded");
        parent.classList.remove("bg-primary");
        parent.classList.remove("text-white");
      }
    }
  }
}

function sendTrade() {
  let tradeDetails = { offer: [], return: [], recipient: "", type: "trade" };
  //Get the names of all of the cards
  let allCards = document.getElementsByClassName("customCheckbox");
  for (let i = 0; i < allCards.length; i++) {
    if (allCards[i].checked) {
      if (allCards[i].name == "offer") {
        tradeDetails.offer.push(allCards[i].value);
      } else if (allCards[i].name == "recieve") {
        tradeDetails.return.push(allCards[i].value);
      }
    }
  }
  //Get the name of the friend
  let friends = document.getElementsByClassName("requestUser");
  for (let i = 0; i < friends.length; i++) {
    console.log(i);
    if (friends[i].classList.contains("active")) {
      tradeDetails.recipient = friends[i].name;
    }
  }
  //If the trade requirement is met
  if (
    (tradeDetails.offer.length != 0 || tradeDetails.return.length != 0) &&
    tradeDetails.recipient != ""
  ) {
    //Send the trade
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        alert("Your trade request has been sent");
      }
    };
    xhttp.open("POST", "/requests", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(tradeDetails));
  } else {
    alert("Please select a user, and at least one card to trade");
  }
}

function toggleSelected(event) {
  //Custom styles to replicate nav-pills used by bootstrap
  let item = event.target;
  let parent = item.parentNode;
  if (item.checked == false) {
    parent.classList.remove("rounded");
    parent.classList.remove("bg-primary");
    parent.classList.remove("text-white");
  } else {
    parent.classList.add("rounded");
    parent.classList.add("bg-primary");
    parent.classList.add("text-white");
  }
}

function findFriend() {
  //Build query with frien data
  let query = "?query=" + document.getElementById("searchInput").value;

  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      //User the response to build a user
      document.getElementById("friendResults").innerHTML = "";
      this.response.forEach((user) => {
        document.getElementById("friendResults").innerHTML +=
          "<div class=' container row justify-content-between mt-2'>" +
          "<h5>" +
          user.username +
          "</h5>" +
          "<button class='btn btn-primary' onclick='sendFriendRequest(event)' value=" +
          user.username +
          "> Add </button>" +
          "</div>";
      });
    } else if (this.status == 204) {
      document.getElementById("friendResults").innerHTML =
        "There are no users by this name";
    }
  };
  xhttp.open("GET", "/users/add" + query, true);
  xhttp.responseType = "json";
  xhttp.send(null);
}

function sendFriendRequest(event) {
  let recipientId = event.target.value;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      alert("Request submitted");
    }
  };
  xhttp.open("POST", "/requests", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify({ recipient: recipientId, type: "friend" }));
}

function respondRequest(event, response) {
  let reqId = event.target.value;
  //The req id is sent to find the trade in the server
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      if (response) {
      }
      alert("A new friend has been added!");
      //Redirect to reload the page
      window.location.href = "http://localhost:3000/users";
      //Removing that request from the list of viewed requests
      let loc = viewedReq.findIndex(reqId);
      viewedReq.splice(loc, 1);
    }
  };
  xhttp.open("POST", "/requests/" + reqId, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify({ id: reqId, accept: response }));
}

function respondTrade(event, response) {
  let reqId = event.target.value;

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      //User the response to build a user
      window.location.href = "http://localhost:3000/users";
      let loc = viewedReq.findIndex(reqId);
      viewedReq.splice(loc, 1);
    } else if (this.status == 204) {
      alert("The request has been cancelled");
      window.location.href = "http://localhost:3000/users";
    }
  };

  xhttp.open("POST", "/requests/" + reqId, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify({ id: reqId, accept: response }));
}

function logout() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      //Redirecting
      window.location.href = "http://localhost:3000";
    }
  };
  xhttp.open("GET", "/users/logout", true);
  xhttp.send();
}
