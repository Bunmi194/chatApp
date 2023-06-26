const { messageZod } = require("./chat-auth");
const { StatusCodes } = require("http-status-codes");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const validateMessageInput = (req, res, next) => {
  try {
    //validate input
    const error = messageZod.safeParse(req.body);
    if (error.success === false) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        success: false,
        message: error.error.issues[0].message,
      });
    }
    return next();
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

const authenticateUser = (req, res, next) => {
  try {
    //authenticate user
    const { authorization } = req.headers;
    const { senderId, recipientId, content } = req.body;
    const token = authorization.split(" ")[1];
    const message = {
      senderId,
      recipientId,
      content,
      delivered: false,
    };
    const verify = jwt.verify(token, JWT_SECRET);
    if (!authorization || !verify || !verify.userId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({
          message:
            "You are not permitted to send messages. Please contact admin",
        });
    }
    req.body.id = verify.userId;
    req.body.message = message;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

const saveMessageToDatabase = (req, res, next) => {
  const { message } = req.body;
  try {
    const newMessage = saveMessageToDatabase(message);
    if (!newMessage) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Please try again" });
    }
    req.body.newMessage = newMessage;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

const sendAllMessages = async (req, res, next) => {
  const { id } = req.body;
  try {
    const messages = await fetchMessagesFromDatabase(id);
    if (!messages) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Please try again" });
    }
    req.body.messages = messages;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

module.exports = {
  validateMessageInput,
  authenticateUser,
  saveMessageToDatabase,
  sendAllMessages,
};
