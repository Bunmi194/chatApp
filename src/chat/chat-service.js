const Message = require("./chat-model");
const mongoose = require("mongoose");

const saveMessageToDatabase = (message) => {
  return Message.create(message)
    .then((message) => {
      return message;
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
};

const updateMessageInDatabase = (messageId, messageObject) => {
  return Message.findByIdAndUpdate(messageId, messageObject)
    .then((message) => {
      return message;
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
};

const fetchMessagesFromDatabase = async (userId) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { recipientId: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "recipientId",
          foreignField: "_id",
          as: "recipient",
        },
      },
      {
        $unwind: "$sender",
      },
      {
        $unwind: "$recipient",
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$senderId", new mongoose.Types.ObjectId(userId)] },
              then: "$recipientId",
              else: "$senderId",
            },
          },
          user: {
            $first: {
              $cond: {
                if: { $eq: ["$senderId", new mongoose.Types.ObjectId(userId)] },
                then: "$recipient",
                else: "$sender",
              },
            },
          },
          messages: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
    return messages;
  } catch (err) {
    console.error(err);
    return null;
  }
};

module.exports = {
  saveMessageToDatabase,
  fetchMessagesFromDatabase,
  updateMessageInDatabase,
};
