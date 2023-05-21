const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
const {
  saveMessageToDatabase,
  fetchMessagesFromDatabase,
} = require("../controllers/chats");
const { messageZod } = require("../auth/chat");
const route = express.Router();

//create & read
route.post("/", async (req, res) => {
  try {
    //validate input
    const error = messageZod.safeParse(req.body);
    //authenticate user
    const { authorization } = req.headers;
    const { senderId, recipientId, content } = req.body;
    // console.log("authorization: ", authorization)
    // console.log("headers: ", req.headers);
    const token = authorization.split(" ")[1];
    
    const message = {
      senderId,
      recipientId,
      content,
      delivered: false
    }
    if (error.success === false) {
        return res.status(400).send({
            success: false,
            message: error.error.issues[0].message
        });
    }
    const verify = jwt.verify(token, jwtSecret);
    if (!authorization || !verify) {
      return res.status(403).json({ message: "Bad request" });
    }
    //save message
    const newMessage = saveMessageToDatabase(message);
    console.log("newMessage: ", newMessage);
    if (!newMessage) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.status(200).json({
      status: "success",
      newMessage,
    });
  } catch (error) {
    console.log("Error: ", error);
  }
});

route.get("/", async (req, res) => {
  try {
    //authenticate user
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const verify = jwt.verify(token, jwtSecret);
    const id = verify.userId;
    console.log("id: ", id)
    if (!authorization || !verify || !id) {
      return res.status(403).json({ message: "Bad request" });
    }
    //send all messages
    const messages = await fetchMessagesFromDatabase(id);
    console.log("messages: ", messages);
    if (!messages) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    return res.status(200).json({
      status: "success",
      messages,
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      status: "Internal Server Error"
    });
  }
});

const chatsRoute = route;
module.exports = chatsRoute;
