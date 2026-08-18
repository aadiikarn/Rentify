const mongoose =
  require("mongoose");

const messageSchema =
  new mongoose.Schema({

    // 👤 SENDER
    sender: {

      type: String,

      required: true

    },

    // 👤 RECEIVER
    receiver: {

      type: String,

      required: true

    },

    // 📦 PRODUCT
    productId: {

      type: String,

      required: true

    },

    // 💬 MESSAGE
    text: {

      type: String,

      required: true

    },

    // ⏰ TIME
    createdAt: {

      type: Date,

      default: Date.now

    }

  });

module.exports =
  mongoose.model(
    "Message",
    messageSchema
  );