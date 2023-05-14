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

let connectedUsers = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', (data) => {
    console.log('User joined room: ' + data.room);
    socket.join(data.room);
    connectedUsers[data.room] = connectedUsers[data.room] || [];
    connectedUsers[data.room].push(data.username);
    io.to(data.room).emit('userList', connectedUsers[data.room]);
  });

  socket.on('message', (data) => {
    console.log('Message received: ' + data.content);
    io.to(data.room).emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    Object.keys(connectedUsers).forEach((room) => {
      if (connectedUsers[room].includes(socket.username)) {
        connectedUsers[room].splice(connectedUsers[room].indexOf(socket.username), 1);
        io.to(room).emit('userList', connectedUsers[room]);
      }
    });
  });
});

server.listen(4000, () => {
  console.log('Server listening on port 4000');
});
