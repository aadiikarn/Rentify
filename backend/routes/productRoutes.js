const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// ➕ Add Product
router.post("/add", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.send("Product Added ✅");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 📦 Get All Products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ❌ Delete Product
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.send("Deleted ✅");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 🔄 Update Status (Accept / Reject)
router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;