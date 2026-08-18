const express =
  require("express");

const router =
  express.Router();

const Review =
  require("../models/Review");

// ✅ ADD REVIEW
router.post(

  "/add",

  async (req, res) => {

    try {

      const newReview =
        new Review(req.body);

      await newReview.save();

      res.status(201).json(
        newReview
      );

    }

    catch (err) {

      console.log(err);

      res.status(500).json({

        error:
          err.message

      });

    }

  }

);

// ✅ GET PRODUCT REVIEWS
router.get(

  "/:productId",

  async (req, res) => {

    try {

      const reviews =
        await Review.find({

          productId:
            req.params.productId

        })

        .sort({
          createdAt: -1
        });

      res.json(reviews);

    }

    catch (err) {

      console.log(err);

      res.status(500).json({

        error:
          err.message

      });

    }

  }

);

module.exports = router;