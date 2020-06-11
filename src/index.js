const { addUser, removeUser, getUser, usersInRoom } = require("./utils/users");

const path = require("path");
const http = require("http");

const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New Websocket connection");

  socket.on("join", ({ username, room }) => {
    socket.join(room); // join a room
    //Welcome user tn room

    const user = username.charAt(0).toUpperCase() + username.slice(1);
    const message = `Welcome ${user}`;
    socket.emit("welcomeMessageUI", message); //to welcomeMessage which displays on UI
    socket.emit("messageOnConsole", message); //to messageOn

    socket.broadcast
      .to(room)
      .emit("messageOnConsole", `${user} has joined us.`);

    socket.on("sendMessage", (message, callback) => {
      const filter = new Filter();

      if (filter.isProfane(message)) {
        return callback("Profanity is not allowed!");
      }
      io.to(room).emit("message", {
        message: message,
        createdAt: new Date().getTime(),
        username: user,
      });

      callback(); //for acknowledgement
    });

    socket.on("sendLocation", (object, callback) => {
      const message = `https://maps.google.com?q=${object.lattitude},${object.longitude}`;
      io.to(room).emit("locationMessage", {
        username: user,
        message: message,
        createdAt: new Date().getTime(),
      });

      callback(); //for acknowledgement
    });
  });

  socket.on("disconnect", () => {
    io.emit("messageOnConsole", "A user has left");
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("App listening at port ", port);
});

/*
 CHEAT SHEET

sending to sender-client only

socket.emit('message', "this is a test");
sending to all clients, include sender

io.emit('message', "this is a test");
//sendin to all clients
sending to all clients except sender

socket.broadcast.emit('message', "this is a test");
sending to all clients in 'game' room(channel) except sender

socket.broadcast.to('game').emit('message', 'nice game');
sending to all clients in 'game' room(channel), include sender

io.in('game').emit('message', 'cool game');
sending to sender client, only if they are in 'game' room(channel)

socket.to('game').emit('message', 'enjoy the game');
sending to all clients in namespace 'myNamespace', include sender

io.of('myNamespace').emit('message', 'gg');
sending to individual socketid

socket.broadcast.to(socketid).emit('message', 'for your eyes only');
 
*/

/*

io.to.emit() -> emits an event to everyone in a room
socket.broadcast.to.emit() sending to everyon in a chatroom to everyone except urself

*/
