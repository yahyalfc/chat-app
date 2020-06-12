const socket = io();

//Elements - as convention we add $ sign
const $messageForm = document.querySelector("#messageForm");
const $messageFormInput = $messageForm.querySelector("input"); //capture input field
const $messageFormButton = document.querySelector("button"); //capture button
const $messages = document.querySelector("#messages");
const $locationButton = document.getElementById("locationButton");
const $sidebar = document.querySelector("#sidebar");

//Templates
const $messageTemplate = document.querySelector("#messageTemplate").innerHTML;
const $locationTemplate = document.querySelector("#locationTemplate").innerHTML;
const $welcomeTemplate = document.querySelector("#welcomeTemplate").innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options - we get Qs because of the library we added in chat.html
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  //new message element
  const $newMessage = $messages.lastElementChild;

  //height of new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = $messages.offsetHeight;

  //height of messages container
  const containerHeight = $messages.scrollHeight;

  //how far i scrolled
  const scrollOffsett = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffsett) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/"; //if error redirect to main page
  }
});

socket.on("welcomeMessageUI", (message) => {
  const html = Mustache.render($welcomeTemplate, {
    message,
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("message", (messageObject) => {
  //here we will display the messaged recieved by emitter
  console.log(messageObject.message);

  const html = Mustache.render($messageTemplate, {
    message: messageObject.message,
    createdAt: moment(messageObject.createdAt).format("hh:mm a"),
    username: messageObject.username,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (messageObject) => {
  const html = Mustache.render($locationTemplate, {
    username: messageObject.username,
    url: messageObject.message,
    createdAt: moment(messageObject.createdAt).format("hh:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  //autoscroll();
});

socket.on("messageOnConsole", (message) => {
  console.log(message);
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
});

// THIS BLOCK OF CODE IS FOR TEXT MESSAGES PART
document.querySelector("#messageForm").addEventListener("submit", (e) => {
  e.preventDefault();
  // disable button click after a click
  $messageFormButton.setAttribute("disabled", "disabled");

  // var message = document.getElementById("message").value;
  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    //enable
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    //third argument is a callback function for acknowledgement
    if (error) {
      console.log(error);
    } else {
      console.log("Message recieved");
    }
  });
});

//THIS PART IS FOR GEO LOCATION PART

$locationButton.addEventListener("click", () => {
  //disable
  $locationButton.setAttribute("disabled", "disabled"); //disable the button till we fetched the data from google api

  if (!navigator.geolocation) {
    return alert("Geo Location not supported by your browser");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    // console.log(position);
    const object = {
      longitude: position.coords.longitude,
      lattitude: position.coords.latitude,
    };
    socket.emit("sendLocation", object, () => {
      //enable
      $locationButton.removeAttribute("disabled");
      console.log("Location shared");
    });
  });
});

//server (emit) -> client (recieve) --acknowledgement--> server
//client (emit) -> server (recieve) --acknowledgement--> client

/*
socket.on("WelcomeClient", (message) => {
  console.log(message);
});
*/

/*
function submitMessage() {
  var message = document.getElementById("Message").value;
  //console.log(message);
  socket.emit("sendMessage", message);
}
*/
