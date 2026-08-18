const mongoose = require("mongoose");

const rentSchema = new mongoose.Schema({

  // 📦 PRODUCT
  productId: {
    type: String,
    required: true
  },

  // 👤 RENTER
  userEmail: {
    type: String,
    required: true
  },

  // 👑 OWNER
  ownerEmail: {
    type: String,
    required: true
  },

  // 📅 START DATE
  startDate: {
    type: Date,
    required: true
  },

  // 📅 END DATE
  endDate: {
    type: Date,
    required: true
  },

  // 🔥 BOOKING STATUS
  status: {
    type: String,

    enum: [
      "Pending Payment",
      "Paid",
      "Accepted",
      "Rejected",
      "Refunded"
    ],

    default: "Pending Payment"
  },

  // 💳 PAYMENT STATUS
  paymentStatus: {
    type: String,

    enum: [
      "Pending",
      "Paid",
      "Refunded"
    ],

    default: "Pending"
  },

  // 💰 TOTAL RENTAL AMOUNT
  amount: {
    type: Number,
    required: true
  },

  // 💳 RAZORPAY ORDER ID
  razorpayOrderId: {
    type: String
  },

  // 💳 RAZORPAY PAYMENT ID
  razorpayPaymentId: {
    type: String
  },

  // ⏰ CREATED
  rentedAt: {
    type: Date,
    default: Date.now
  }

});

module.exports =
  mongoose.models.Rent ||
  mongoose.model("Rent", rentSchema);