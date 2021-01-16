let register = document.getElementById("register");
let login = document.getElementById("login");

//Sending login data to the user
function sendData() {
  let username = document.getElementById("username").value;
  let pword = document.getElementById("pword").value;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      console.log("Lets render another page");
    } else if (this.readyState == 4 && this.status == 404) {
      alert("There is no user by those requirements");
    }
    console.log("back");
  };

  xhttp.open("POST", "users", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(
    JSON.stringify({ user: username, password: pword, type: this.value })
  );
}
