const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  },
  transports: ['websocket', 'polling']
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user)=> user.userId === userId) && users.push({userId, socketId});
  console.log("users joined: ", JSON.stringify(users))
}

const removeUser = (socketId) => {
  users = users.filter((user)=> user.socketId !== socketId);
  console.log("users left: ", JSON.stringify(users))
}
io.on('connection', (socket) => {
  console.log('A user connected');
  io.emit("welcome", "welcome everyone to my chat APP");
  socket.on('join', (userId) => {
    // console.log('User joined room: ' + userId);
    addUser(userId, socket.id);
    io.emit('userList', users);
  });

  socket.on('message', (data) => {
    console.log('data: ' + JSON.stringify(data));
    console.log('recipient: ' + data.recipient);
    console.log('Message received: ' + data.content);
    if (data.recipient) {
      console.log(io.sockets);
      io.to(data.recipient).emit('privateMessage', data.content);
      const userSocket = io.sockets.connected[data.recipient];
      if (userSocket) {
        userSocket.emit('message', data);
        console.log("message sent to " + data.recipient)
      } else {
        console.log(`User ${data.recipient} is not online`);
        // Store the message in a database or file to be sent later
      }
    } else {
      //do nothing
      // io.to(data.room).emit('message', data);
      console.log("nothing")
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    removeUser(socket.id);
    io.emit('userList', users);
  });
});

server.listen(4000, () => {
  console.log('Server listening on port 4000');
});
