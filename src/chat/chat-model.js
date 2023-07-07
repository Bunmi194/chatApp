const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    recipientId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
