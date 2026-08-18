const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const Payment = require("../models/Payment");
const Rent = require("../models/Rent");

const router = express.Router();

// 💳 RAZORPAY CONFIGURATION
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 🔍 SAFE CREDENTIAL CHECK
console.log(
  "Razorpay Key Loaded:",
  !!process.env.RAZORPAY_KEY_ID
);

console.log(
  "Razorpay Secret Loaded:",
  !!process.env.RAZORPAY_KEY_SECRET
);

console.log(
  "Razorpay Key Type:",
  process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_")
    ? "TEST"
    : "UNKNOWN"
);


// =====================================================
// 💳 CREATE RAZORPAY ORDER
// =====================================================

router.post("/create-order", async (req, res) => {

  try {

    const { amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {

      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });

    }

    // Razorpay uses paise
    const options = {

      amount: Math.round(amount * 100),

      currency: "INR",

      receipt: `rentify_${Date.now()}`,

    };

    // Create Razorpay order
    const order =
      await razorpay.orders.create(
        options
      );

    console.log(
      "Razorpay Order Created:",
      order.id
    );

    return res.status(200).json({

      success: true,

      order: order,

    });

  }

  catch (error) {

    console.error(
      "RAZORPAY ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Unable to create payment order",

    });

  }

});


// =====================================================
// 🔐 VERIFY PAYMENT + SAVE PAYMENT + UPDATE BOOKING
// =====================================================

router.post(
  "/verify-payment",
  async (req, res) => {

    try {

      const {

        razorpay_order_id,

        razorpay_payment_id,

        razorpay_signature,

        userEmail,

        productId,

        bookingId,

        amount,

      } = req.body;


      // =================================================
      // 🔴 REQUIRED DATA CHECK
      // =================================================

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !userEmail ||
        !productId ||
        !bookingId ||
        !amount
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Required payment details are missing",

        });

      }


      // =================================================
      // 🔍 FIND BOOKING
      // =================================================

      const rent =
        await Rent.findById(
          bookingId
        );


      if (!rent) {

        return res.status(404).json({

          success: false,

          message:
            "Booking not found",

        });

      }


      // 🔒 MAKE SURE PAYMENT MATCHES BOOKING
      if (
        rent.userEmail !== userEmail ||
        String(rent.productId) !==
          String(productId)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Payment details do not match booking",

        });

      }


      // =================================================
      // 🔐 GENERATE SIGNATURE
      // =================================================

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
          )
          .update(
            razorpay_order_id +
            "|" +
            razorpay_payment_id
          )
          .digest("hex");


      // =================================================
      // ❌ INVALID SIGNATURE
      // =================================================

      if (
        generatedSignature !==
        razorpay_signature
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Payment verification failed ❌",

        });

      }


      // =================================================
      // 🛑 PREVENT DUPLICATE PAYMENT RECORD
      // =================================================

      const existingPayment =
        await Payment.findOne({

          razorpayPaymentId:
            razorpay_payment_id,

        });


      if (existingPayment) {

        return res.status(200).json({

          success: true,

          message:
            "Payment already verified ✅",

          paymentId:
            existingPayment._id,

        });

      }


      // =================================================
      // 💾 SAVE PAYMENT
      // =================================================

      const payment =
        new Payment({

          userEmail:
            userEmail,

          productId:
            productId,

          bookingId:
            bookingId,

          amount:
            amount,

          razorpayOrderId:
            razorpay_order_id,

          razorpayPaymentId:
            razorpay_payment_id,

          razorpaySignature:
            razorpay_signature,

          status:
            "paid",

        });


      await payment.save();


      // =================================================
      // 🔄 UPDATE RENT / BOOKING
      // =================================================

      rent.status =
        "Paid";

      rent.paymentStatus =
        "Paid";

      rent.razorpayOrderId =
        razorpay_order_id;

      rent.razorpayPaymentId =
        razorpay_payment_id;

      await rent.save();


      // =================================================
      // 🔔 NOTIFY OWNER
      // =================================================

      const io =
        req.app.get("io");

      io.emit(
        "newRequest",
        {

          message:
            "New Paid Booking Request 🔥",

          rent:
            rent,

        }
      );


      // =================================================
      // ✅ SUCCESS
      // =================================================

      console.log(
        "Payment Saved Successfully:",
        payment._id
      );

      console.log(
        "Booking Updated To Paid:",
        rent._id
      );


      return res.status(200).json({

        success: true,

        message:
          "Payment verified and booking confirmed for owner review ✅",

        paymentId:
          payment._id,

        bookingId:
          rent._id,

      });

    }

    catch (error) {

      console.error(
        "PAYMENT VERIFICATION ERROR:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Payment verification error",

      });

    }

  }
);


module.exports = router;