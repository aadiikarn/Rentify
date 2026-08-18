const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// Create booking with availability check
router.post("/add", async (req, res) => {
  try {
    const { productId, fromDate, toDate } = req.body;

    // 🔥 Check overlapping bookings
    const existing = await Booking.find({
      productId,
      $or: [
        {
          fromDate: { $lte: toDate },
          toDate: { $gte: fromDate }
        }
      ]
    });

    if (existing.length > 0) {
      return res.status(400).send("Product not available ❌");
    }

    const booking = new Booking(req.body);
    await booking.save();

    res.send("Booking Successful ✅");

  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;