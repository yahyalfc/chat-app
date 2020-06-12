const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");
const { capitalizeFirst } = require("./utils/functions");
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

  socket.on("join", ({ username, room }, callback) => {
    console.log(socket.id);
    const { error, user } = addUser({ id: socket.id, username, room });

    const userx = getUser(socket.id);

    if (error) {
      return callback(error);
    }

    socket.join(userx.room); // join a room
    //Welcome user to room
    const usernameC = capitalizeFirst(userx.username);

    const message = `Welcome ${usernameC}`;
    socket.emit("welcomeMessageUI", message); //to welcomeMessage which displays on UI
    socket.emit("messageOnConsole", message); //to messageOn

    socket.broadcast
      .to(userx.room)
      .emit("messageOnConsole", `${usernameC} has joined us.`)
      .to(userx.room)
      .emit("welcomeMessageUI", `${usernameC} has joined us.`);

    io.to(userx.room).emit("roomData", {
      room: userx.room,
      users: getUsersInRoom(userx.room),
    });

    socket.on("sendMessage", (message, callback) => {
      const filter = new Filter();

      if (filter.isProfane(message)) {
        return callback("Profanity is not allowed!");
      }
      io.to(userx.room).emit("message", {
        message: message,
        createdAt: new Date().getTime(),
        username: usernameC,
      });

      callback(); //for acknowledgement
    });

    socket.on("sendLocation", (object, callback) => {
      const message = `https://maps.google.com?q=${object.lattitude},${object.longitude}`;
      io.to(userx.room).emit("locationMessage", {
        username: usernameC,
        message: message,
        createdAt: new Date().getTime(),
      });

      callback(); //for acknowledgement
    });
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      const name = user.username;

      io.to(user.room).emit("messageOnConsole", `${name} has left`);
      io.to(user.room).emit("welcomeMessageUI", `${name} has left`);

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
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
