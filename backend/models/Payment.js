const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // 👤 RENTER
    userEmail: {
      type: String,
      required: true,
    },

    // 📦 PRODUCT
    productId: {
      type: String,
      required: true,
    },

    // 📅 RENTAL / BOOKING
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rent",
      required: true,
    },

    // 💰 PAYMENT AMOUNT
    amount: {
      type: Number,
      required: true,
    },

    // 💳 RAZORPAY ORDER
    razorpayOrderId: {
      type: String,
      required: true,
    },

    // 💳 RAZORPAY PAYMENT
    razorpayPaymentId: {
      type: String,
      required: true,
    },

    // 🔐 RAZORPAY SIGNATURE
    razorpaySignature: {
      type: String,
      required: true,
    },

    // 💰 REFUND ID
    refundId: {
      type: String,
      default: null,
    },

    // ✅ PAYMENT STATUS
    status: {
      type: String,

      enum: [
        "created",
        "paid",
        "failed",
        "refunded"
      ],

      default: "paid",
    },
  },
  {
    timestamps: true,
  }
);


// ✅ PREVENT MONGOOSE OVERWRITE MODEL ERROR
module.exports =
  mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);