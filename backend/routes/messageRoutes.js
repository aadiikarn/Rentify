const express =
  require("express");

const router =
  express.Router();

const Message =
  require("../models/Message");

// ✅ TEST ROUTE
router.get(

  "/test",

  (req, res) => {

    res.send(
      "Message Route Working ✅"
    );

  }

);

// ✅ SEND MESSAGE
router.post(

  "/send",

  async (req, res) => {

    try {

      const newMessage =
        new Message(req.body);

      await newMessage.save();

      // 🔔 SOCKET EVENT
      const io =
        req.app.get("io");

      io.emit(
        "newMessage",
        newMessage
      );

      res.status(201)
      .json(newMessage);

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

// ✅ GET ALL MESSAGES
router.get(

  "/all",

  async (req, res) => {

    try {

      const messages =
        await Message.find()

        .sort({
          createdAt: -1
        });

      res.json(messages);

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

// ✅ GET CHAT
router.get(

  "/:productId/:user1/:user2",

  async (req, res) => {

    try {

      const {
        productId,
        user1,
        user2
      } = req.params;

      const messages =
        await Message.find({

          productId,

          $or: [

            {
              sender: user1,
              receiver: user2
            },

            {
              sender: user2,
              receiver: user1
            }

          ]

        })

        .sort({
          createdAt: 1
        });

      res.json(messages);

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