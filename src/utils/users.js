const users = [];

// add User, remove user, getUser, getUsersinRoom

const addUser = ({ id, username, room }) => {
  //clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  //Check for existing user
  const existingUser = users.find((user) => {
    return user.username === username && user.username === username;
  });

  //Validate username
  if (existingUser) {
    return {
      error: "Username already in the room!",
    };
  }

  //Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  var index = users.findIndex((user) => user.id === id);

  if (index === -1) {
    return {
      error: "User not found",
    };
  }
  if (index > -1) {
    users.splice(index, 1);
    return users;
  }
};

const getUser = (id) => {
  var user = users.find((user) => user.id === id);

  if (!user) {
    return {
      error: "User not found",
    };
  }

  return user;
};

const usersInRoom = (room) => {
  room = room.trim().toLowerCase();
  const array = users.filter((user) => user.room === room);
  return array;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  usersInRoom,
};
