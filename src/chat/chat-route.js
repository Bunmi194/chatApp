const express = require("express");
const { StatusCodes } = require("http-status-codes");
require("dotenv").config();
const route = express.Router();

const {
  validateMessageInput,
  authenticateUser,
  saveMessageToDatabase,
  postChat,
  getChats
} = require("./chat-controller");

//create & read
route.post(
  "/",
  validateMessageInput,
  authenticateUser,
  saveMessageToDatabase,
  postChat
);

route.get("/", authenticateUser, getChats);

const chatsRoute = route;
module.exports = chatsRoute;
