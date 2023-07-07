const express = require("express");
const { StatusCodes } = require("http-status-codes");
require("dotenv").config();
const route = express.Router();

const {
  validateMessageInput,
  authenticateUser,
  saveMessageToDatabaseController,
  postChat,
  getChats,
  sendAllMessages
} = require("./chat-controller");

//create & read
route.post(
  "/",
  validateMessageInput,
  authenticateUser,
  saveMessageToDatabaseController,
  postChat
);

route.get("/", authenticateUser, sendAllMessages, getChats);

const chatsRoute = route;
module.exports = chatsRoute;
