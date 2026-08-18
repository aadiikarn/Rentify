const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  userEmail: String,
  fromDate: String,
  toDate: String
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);