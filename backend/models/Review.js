const mongoose =
  require("mongoose");

const reviewSchema =
  new mongoose.Schema({

    // 📦 PRODUCT
    productId: {

      type: String,

      required: true

    },

    // 👤 USER
    userEmail: {

      type: String,

      required: true

    },

    // ⭐ RATING
    rating: {

      type: Number,

      required: true

    },

    // 📝 REVIEW TEXT
    comment: {

      type: String,

      required: true

    },

    // ⏰ CREATED
    createdAt: {

      type: Date,

      default: Date.now

    }

  });

module.exports =
  mongoose.model(
    "Review",
    reviewSchema
  );