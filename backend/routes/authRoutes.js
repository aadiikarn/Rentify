const express = require("express");

const router = express.Router();

const User = require("../models/User");

// =========================================
// 🚀 REGISTER
// =========================================
router.post("/register", async (req, res) => {

  try {

    // ✅ CHECK EXISTING USER
    const existingUser =
      await User.findOne({

        email:
          req.body.email

      });

    if (existingUser) {

      return res.status(400).send(
        "User already exists ❌"
      );

    }

    // ✅ CREATE USER
    const user = new User({

      name:
        req.body.name,

      email:
        req.body.email,

      password:
        req.body.password,

      image: "",

      address: "",

      phone: ""

    });

    // 💾 SAVE
    await user.save();

    // ✅ RESPONSE
    res.json(user);

  }

  catch (err) {

    console.log(err);

    res.status(500).send(
      err.message
    );

  }

});

// =========================================
// 🔐 LOGIN
// =========================================
router.post("/login", async (req, res) => {

  try {

    // ✅ FIND USER
    const user =
      await User.findOne({

        email:
          req.body.email,

        password:
          req.body.password

      });

    // ❌ INVALID
    if (!user) {

      return res.status(400).send(
        "Invalid Credentials ❌"
      );

    }

    // ✅ LOGIN SUCCESS
    res.json(user);

  }

  catch (err) {

    console.log(err);

    res.status(500).send(
      err.message
    );

  }

});

// =========================================
// 👤 UPDATE PROFILE
// =========================================
router.put("/update", async (req, res) => {

  try {

    // ✅ FIND & UPDATE USER
    const updatedUser =
      await User.findByIdAndUpdate(

        req.body._id,

        {

          name:
            req.body.name,

          email:
            req.body.email,

          image:
            req.body.image,

          address:
            req.body.address,

          phone:
            req.body.phone

        },

        {

          new: true

        }

      );

    // ❌ USER NOT FOUND
    if (!updatedUser) {

      return res.status(404).send(
        "User not found ❌"
      );

    }

    // ✅ SEND UPDATED USER
    res.json(updatedUser);

  }

  catch (err) {

    console.log(err);

    res.status(500).send(
      err.message
    );

  }

});

module.exports = router;