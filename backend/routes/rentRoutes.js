const express = require("express");
const axios = require("axios");

const router = express.Router();

const Rent = require("../models/Rent");
const Payment = require("../models/Payment");
const Product = require("../models/Product");

// =====================================================
// 📝 CREATE BOOKING
// =====================================================

router.post("/rent", async (req, res) => {
  try {
    const {
      productId,
      userEmail,
      ownerEmail,
      startDate,
      endDate,
      amount,
    } = req.body;

    // 🔴 VALIDATION
    if (
      !productId ||
      !userEmail ||
      !ownerEmail ||
      !startDate ||
      !endDate ||
      !amount
    ) {
      return res.status(400).json({
        success: false,
        message: "Required booking details are missing",
      });
    }

    // 🔍 CHECK PRODUCT
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ❌ OWNER CHECK
    if (
      userEmail.toLowerCase() ===
      ownerEmail.toLowerCase()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot rent your own product",
      });
    }

    // 🔍 CHECK DATE CONFLICT
    const existingBooking = await Rent.findOne({
      productId: productId,

      status: {
        $in: [
          "Pending Payment",
          "Paid",
          "Accepted",
        ],
      },

      startDate: {
        $lte: new Date(endDate),
      },

      endDate: {
        $gte: new Date(startDate),
      },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message:
          "Product is already booked for these dates",
      });
    }

    // 📝 CREATE BOOKING
    const newRent = new Rent({
      productId,
      userEmail,
      ownerEmail,
      startDate,
      endDate,
      amount,
      status: "Pending Payment",
      paymentStatus: "Pending",
    });

    await newRent.save();

    console.log(
      "✅ BOOKING CREATED:",
      newRent._id
    );

    return res.status(201).json({
      success: true,
      message:
        "Booking created. Proceed to payment 💳",
      rent: newRent,
    });

  } catch (err) {
    console.error(
      "❌ CREATE RENT ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});


// =====================================================
// 📋 GET ALL RENT REQUESTS
// =====================================================

router.get("/", async (req, res) => {
  try {
    const rents = await Rent.find().sort({
      rentedAt: -1,
    });

    return res.json(rents);

  } catch (err) {
    console.error(
      "❌ GET RENTS ERROR:",
      err
    );

    return res.status(500).json({
      error: err.message,
    });
  }
});


// =====================================================
// 📅 GET BOOKINGS FOR PRODUCT
// =====================================================

router.get(
  "/product/:id",
  async (req, res) => {
    try {
      const bookings = await Rent.find({
        productId: req.params.id,

        status: {
          $in: [
            "Paid",
            "Accepted",
          ],
        },
      });

      return res.json(bookings);

    } catch (err) {
      console.error(
        "❌ GET PRODUCT BOOKINGS ERROR:",
        err
      );

      return res.status(500).json({
        error: err.message,
      });
    }
  }
);


// =====================================================
// 💳 MARK BOOKING AS PAID
// =====================================================

router.put(
  "/:id/payment-success",
  async (req, res) => {
    try {
      const {
        razorpayOrderId,
        razorpayPaymentId,
      } = req.body;

      // 🔴 VALIDATION
      if (
        !razorpayOrderId ||
        !razorpayPaymentId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment details are missing",
        });
      }

      // 🔍 FIND BOOKING
      const rent =
        await Rent.findById(req.params.id);

      if (!rent) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found",
        });
      }

      // 💳 UPDATE PAYMENT STATUS
      rent.status = "Paid";
      rent.paymentStatus = "Paid";

      rent.razorpayOrderId =
        razorpayOrderId;

      rent.razorpayPaymentId =
        razorpayPaymentId;

      await rent.save();

      console.log(
        "✅ BOOKING MARKED AS PAID:",
        rent._id
      );

      // 🔔 OWNER NOTIFICATION
      const io = req.app.get("io");

      if (io) {
        io.emit("newRequest", {
          message:
            "New Paid Booking Request 🔥",
          rent,
        });
      }

      return res.json({
        success: true,
        message:
          "Booking marked as paid successfully ✅",
        rent,
      });

    } catch (err) {
      console.error(
        "❌ PAYMENT SUCCESS ERROR:",
        err
      );

      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);


// =====================================================
// ✅ ACCEPT / ❌ REJECT BOOKING
// =====================================================

router.put(
  "/:id",
  async (req, res) => {
    try {
      const { status } = req.body;

      console.log(
        "\n===================================="
      );

      console.log(
        "📦 BOOKING UPDATE REQUEST"
      );

      console.log(
        "Booking ID:",
        req.params.id
      );

      console.log(
        "Requested Status:",
        status
      );

      console.log(
        "====================================\n"
      );


      // 🔴 VALID STATUS CHECK
      if (
        status !== "Accepted" &&
        status !== "Rejected"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid booking status",
        });
      }


      // 🔍 FIND BOOKING
      const rent =
        await Rent.findById(req.params.id);

      if (!rent) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found",
        });
      }


      console.log(
        "Booking found:",
        rent._id
      );

      console.log(
        "Payment Status:",
        rent.paymentStatus
      );


      // 🔒 PAYMENT REQUIRED
      if (
        rent.paymentStatus !==
        "Paid"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment is required before owner decision",
        });
      }


      // =================================================
      // ❌ REJECT + REFUND
      // =================================================

      if (status === "Rejected") {

        console.log(
          "\n===================================="
        );

        console.log(
          "❌ REJECTING BOOKING + REFUND"
        );

        console.log(
          "===================================="
        );


        // 🔍 FIND PAYMENT
        const payment =
          await Payment.findOne({
            bookingId: rent._id,
            status: "paid",
          });

        if (!payment) {

          console.log(
            "❌ PAYMENT RECORD NOT FOUND"
          );

          return res.status(400).json({
            success: false,
            message:
              "Payment record not found",
          });
        }


        console.log(
          "MongoDB Payment Found:",
          payment._id
        );

        console.log(
          "MongoDB Payment ID:",
          payment.razorpayPaymentId
        );

        console.log(
          "MongoDB Amount:",
          payment.amount
        );


        // =================================================
        // 🔐 RAZORPAY CREDENTIALS
        // =================================================

        const keyId =
          process.env.RAZORPAY_KEY_ID;

        const keySecret =
          process.env.RAZORPAY_KEY_SECRET;


        if (
          !keyId ||
          !keySecret
        ) {

          console.error(
            "❌ RAZORPAY API CREDENTIALS MISSING"
          );

          return res.status(500).json({
            success: false,
            message:
              "Razorpay credentials missing in backend .env",
          });
        }


        // =================================================
        // 🔍 FETCH PAYMENT FROM RAZORPAY
        // =================================================

        let razorpayPayment;

        try {

          console.log(
            "\n🔍 FETCHING PAYMENT FROM RAZORPAY..."
          );

          const paymentResponse =
            await axios.get(

              `https://api.razorpay.com/v1/payments/${payment.razorpayPaymentId}`,

              {
                auth: {
                  username:
                    keyId,

                  password:
                    keySecret,
                },

                timeout: 30000,
              }
            );


          razorpayPayment =
            paymentResponse.data;


          console.log(
            "\n========== RAZORPAY PAYMENT =========="
          );

          console.log(
            "Payment ID:",
            razorpayPayment.id
          );

          console.log(
            "Status:",
            razorpayPayment.status
          );

          console.log(
            "Amount:",
            razorpayPayment.amount
          );

          console.log(
            "Currency:",
            razorpayPayment.currency
          );

          console.log(
            "Method:",
            razorpayPayment.method
          );

          console.log(
            "International:",
            razorpayPayment.international
          );

          console.log(
            "Captured:",
            razorpayPayment.captured
          );

          console.log(
            "Amount Refunded:",
            razorpayPayment.amount_refunded
          );

          console.log(
            "Refund Status:",
            razorpayPayment.refund_status
          );

          console.log(
            "====================================\n"
          );

        } catch (paymentError) {

          console.error(
            "❌ FAILED TO FETCH RAZORPAY PAYMENT"
          );

          console.error(
            paymentError.response?.data ||
            paymentError.message
          );

          return res.status(400).json({
            success: false,
            message:
              "Unable to verify Razorpay payment",

            error:
              paymentError.response?.data
                ?.error
                ?.description ||
              paymentError.message,
          });
        }


        // =================================================
        // 🔒 PAYMENT MUST BE CAPTURED
        // =================================================

        if (
          razorpayPayment.status !==
          "captured"
        ) {

          return res.status(400).json({
            success: false,
            message:
              "Payment is not captured by Razorpay",
          });
        }


        // =================================================
        // 💰 REFUND AMOUNT
        // =================================================

        const refundAmount =
          Number(
            razorpayPayment.amount
          );


        if (
          !refundAmount ||
          refundAmount <= 0
        ) {

          return res.status(400).json({
            success: false,
            message:
              "Invalid refund amount",
          });
        }


        console.log(
          "💰 REFUND AMOUNT IN PAISE:",
          refundAmount
        );

        console.log(
          "💰 REFUND AMOUNT IN RUPEES:",
          refundAmount / 100
        );


        // =================================================
        // 💰 DIRECT RAZORPAY REFUND
        // =================================================

        let refund;

        try {

          console.log(
            "\n🔄 SENDING REFUND REQUEST TO RAZORPAY..."
          );


          // IMPORTANT:
          // Minimal refund request.
          // Only amount is sent.
          // Axios handles Basic Authentication.

          const refundResponse =
            await axios.post(

              `https://api.razorpay.com/v1/payments/${payment.razorpayPaymentId}/refund`,

              {
                amount:
                  Number(
                    razorpayPayment.amount
                  ),
              },

              {
                auth: {
                  username:
                    keyId,

                  password:
                    keySecret,
                },

                headers: {
                  "Content-Type":
                    "application/json",
                },

                timeout: 30000,
              }
            );


          refund =
            refundResponse.data;


          console.log(
            "\n===================================="
          );

          console.log(
            "✅ RAZORPAY REFUND SUCCESS"
          );

          console.log(
            "Refund ID:",
            refund.id
          );

          console.log(
            "Refund Amount:",
            refund.amount
          );

          console.log(
            "Refund Status:",
            refund.status
          );

          console.log(
            "====================================\n"
          );


        } catch (refundError) {

          console.error(
            "\n❌ RAZORPAY REFUND ERROR"
          );

          console.error(
            "Status Code:",
            refundError.response?.status
          );

          console.error(
            "Error Code:",
            refundError.response?.data
              ?.error
              ?.code
          );

          console.error(
            "Description:",
            refundError.response?.data
              ?.error
              ?.description
          );

          console.error(
            "Full Error:",
            refundError.response?.data ||
            refundError.message
          );


          return res.status(400).json({

            success: false,

            message:
              "Razorpay refund failed",

            error:
              refundError.response?.data
                ?.error
                ?.description ||
              refundError.message,

            razorpayError:
              refundError.response?.data
                ?.error ||
              null,
          });
        }


        // =================================================
        // 💾 SAVE REFUND DETAILS
        // =================================================

        payment.status =
          "refunded";

        payment.refundId =
          refund.id;

        await payment.save();


        console.log(
          "✅ PAYMENT RECORD UPDATED"
        );


        // =================================================
        // 🔄 UPDATE BOOKING
        // =================================================

        rent.status =
          "Refunded";

        rent.paymentStatus =
          "Refunded";

        await rent.save();


        // =================================================
        // 📦 MAKE PRODUCT AVAILABLE AGAIN
        // =================================================

        await Product.findByIdAndUpdate(
          rent.productId,
          {
            status:
              "Available",
          }
        );


        console.log(
          "✅ PRODUCT MARKED AVAILABLE"
        );


        // =================================================
        // 🔔 NOTIFICATION
        // =================================================

        const io =
          req.app.get("io");

        if (io) {

          io.emit(
            "bookingRejected",
            {
              message:
                "Booking rejected and refund initiated 💰",

              rent,
            }
          );
        }


        // =================================================
        // ✅ FINAL RESPONSE
        // =================================================

        return res.json({

          success: true,

          message:
            "Booking rejected and refund initiated successfully 💰",

          rent,

          refund,
        });
      }


      // =================================================
      // ✅ ACCEPT BOOKING
      // =================================================

      if (status === "Accepted") {

        console.log(
          "\n===================================="
        );

        console.log(
          "✅ ACCEPTING BOOKING"
        );

        console.log(
          "===================================="
        );


        // 📦 MAKE PRODUCT UNAVAILABLE
        await Product.findByIdAndUpdate(
          rent.productId,
          {
            status:
              "Unavailable",
          }
        );


        // 🔄 UPDATE BOOKING
        rent.status =
          "Accepted";

        await rent.save();


        console.log(
          "✅ BOOKING ACCEPTED:",
          rent._id
        );


        // 🔔 NOTIFICATION
        const io =
          req.app.get("io");

        if (io) {

          io.emit(
            "bookingAccepted",
            {
              message:
                "Booking Accepted ✅",

              rent,
            }
          );
        }


        return res.json({

          success: true,

          message:
            "Booking accepted successfully ✅",

          rent,
        });
      }

    } catch (err) {

      console.error(
        "\n❌ UPDATE BOOKING ERROR:"
      );

      console.error(err);

      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);


// =====================================================
// ❌ DELETE RENT REQUEST
// =====================================================

router.delete(
  "/:id",
  async (req, res) => {

    try {

      await Rent.findByIdAndDelete(
        req.params.id
      );

      return res.json({
        message:
          "Rental deleted successfully",
      });

    } catch (err) {

      console.error(
        "❌ DELETE RENT ERROR:",
        err
      );

      return res.status(500).json({
        error: err.message,
      });
    }
  }
);


// =====================================================
// ⚠️ TEMP RESET
// =====================================================

router.get(
  "/reset/all",
  async (req, res) => {

    try {

      await Rent.deleteMany({});

      await Payment.deleteMany({});

      return res.json({
        message:
          "All rents and payments deleted",
      });

    } catch (err) {

      console.error(
        "❌ RESET ERROR:",
        err
      );

      return res.status(500).json({
        error: err.message,
      });
    }
  }
);


// =====================================================
// 🚀 EXPORT
// =====================================================

module.exports = router;