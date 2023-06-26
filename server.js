const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const usersRoute = require("./src/user/user-route");
const chatsRoute = require("./src/chat/chat-route");
const googleRoute = require("./src/google/google-route");
const connectDB = require("./config/database");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.use(session({
  secret: 'chat',
  resave: false,
  saveUninitialized: false
}));

let users = [];

app.use(cors({
  origin: '*',
}))
app.use(morgan('tiny'));
app.use(express.urlencoded());
app.use(express.json());
connectDB();


app.use(passport.initialize());
app.use(passport.session());

app.use("/v1/users", usersRoute);
app.use("/v1/chats", chatsRoute);
app.use("/v1/strategy", googleRoute);

  const addUser = (userId, socketId) => {
    !users.some((user)=> user.userId === userId) && users.push({userId, socketId});
    console.log("users joined: ", JSON.stringify(users))
  }
  
  const removeUser = (socketId) => {
    users = users.filter((user)=> user.socketId !== socketId);
    console.log("users left: ", JSON.stringify(users))
  }
  
try {
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
      console.log('users: ' + JSON.stringify(users));
      const receiverId = data.receiverId;
      console.log('receiverId: ' + JSON.stringify(receiverId));
      if(receiverId){
        const recipientId = users.find(user => user.userId === receiverId);
        console.log('recipientId: ', recipientId);
        if(recipientId){
          //user is already connected--online
          io.to(recipientId.socketId).emit('privateMessage', data);
        }
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
} catch (error) {
  console.log(error);
}


