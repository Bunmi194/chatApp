const express = require("express");
const { StatusCodes } = require("http-status-codes");
require("dotenv").config();
const route = express.Router();

const {
  validateMessageInput,
  authenticateUser,
  saveMessageToDatabase,
} = require("./chat-controller");

//create & read
route.post(
  "/",
  validateMessageInput,
  authenticateUser,
  saveMessageToDatabase,
  async (req, res) => {
    const { newMessage } = req.body;
    res.status(StatusCodes.OK).json({
      status: "success",
      newMessage,
    });
  }
);

route.get("/", authenticateUser, async (req, res) => {
  const { messages } = req.body;
  return res.status(StatusCodes.OK).json({
    status: "success",
    messages,
  });
});

const chatsRoute = route;
module.exports = chatsRoute;
