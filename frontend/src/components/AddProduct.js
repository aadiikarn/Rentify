import React, {
  useState
} from "react";

import axios from "axios";

import "./AddProduct.css";

function AddProduct() {

  const [product, setProduct] =
    useState({

      name: "",
      price: "",
      description: "",
      image: "",
      category: ""

    });

  const [customCategory,
    setCustomCategory] =
    useState("");

  // 🔄 IMAGE LOADING
  const [uploading,
    setUploading] =
    useState(false);

  // 👤 CURRENT USER
  const storedUser =
    JSON.parse(
      localStorage.getItem("user")
    );

  // 🏷️ CATEGORIES
  const categories = [

    "Electronics",
    "Vehicles",
    "Furniture",
    "Books",
    "Clothing",
    "Sports",
    "Photography",
    "Gaming",
    "Home Appliances",
    "Tools",
    "Musical Instruments",
    "Event Items",
    "Travel Gear",
    "Office Supplies",
    "Fitness Equipment",
    "Baby Products",
    "Medical Equipment",
    "Camping Gear",
    "Party Supplies",
    "Others"

  ];

  // ✍️ HANDLE INPUT
  const handleChange = (e) => {

    setProduct({

      ...product,

      [e.target.name]:
        e.target.value

    });

  };

  // ☁️ CLOUDINARY IMAGE UPLOAD
  const handleImage = async (e) => {

    const file =
      e.target.files[0];

    // ❌ NO FILE
    if (!file) return;

    // ✅ VALID IMAGE TYPES
    const allowedTypes = [

      "image/jpeg",

      "image/jpg",

      "image/png",

      "image/webp"

    ];

    // ❌ INVALID TYPE
    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      alert(
        "Only JPG, JPEG, PNG and WEBP images allowed ❌"
      );

      return;

    }

    try {

      setUploading(true);

      // 🚀 FORM DATA
      const data =
        new FormData();

      data.append(
        "file",
        file
      );

      data.append(
        "upload_preset",
        "rentify_upload"
      );

      data.append(
        "cloud_name",
        "dw8myue1e"
      );

      // ☁️ UPLOAD TO CLOUDINARY
      const res =
        await axios.post(

          "https://api.cloudinary.com/v1_1/dw8myue1e/image/upload",

          data

        );

      // ✅ SAVE IMAGE URL
      setProduct({

        ...product,

        image:
          res.data.secure_url

      });

      alert(
        "Image Uploaded Successfully ✅"
      );

    }

    catch (err) {

      console.log(err);

      alert(
        "Image upload failed ❌"
      );

    }

    finally {

      setUploading(false);

    }

  };

  // 🚀 SUBMIT PRODUCT
  const handleSubmit = (e) => {

    e.preventDefault();

    // 🔒 LOGIN CHECK
    if (!storedUser) {

      alert(
        "Please login first ❌"
      );

      return;

    }

    // ❌ IMAGE CHECK
    if (!product.image) {

      alert(
        "Please upload image first ❌"
      );

      return;

    }

    // 🏷️ FINAL CATEGORY
    const finalCategory =

      product.category ===
      "Others"

      ? customCategory

      : product.category;

    // 🚀 SEND DATA
    axios.post(

      "/api/products/add",

      {

        ...product,

        category:
          finalCategory,

        ownerEmail:
          storedUser.email,

        status:
          "Available"

      }

    )

    .then(() => {

      alert(
        "Product Added Successfully ✅"
      );

      window.location.href = "/";

    })

    .catch((err) => {

      console.log(err);

      alert(
        "Error adding product ❌"
      );

    });

  };

  return (

    <div className="add-page">

      <form

        onSubmit={handleSubmit}

        className="add-form"

      >

        {/* 🔥 HEADER */}
        <div className="add-header">

          <h1>

            Add Product

          </h1>

          <p>

            Share your products
            with the Rentify
            community 🚀

          </p>

        </div>

        {/* 📸 IMAGE SECTION */}
        <div className="image-upload-box">

          {product.image ? (

            <img

              src={product.image}

              alt="preview"

              className="preview-image"

            />

          ) : (

            <div className="upload-placeholder">

              {uploading

                ? "Uploading Image..."

                : "📸 Upload Product Image"}

            </div>

          )}

          <input

            type="file"

            accept=".jpg,.jpeg,.png,.webp"

            onChange={handleImage}

            required

          />

        </div>

        {/* 📦 PRODUCT NAME */}
        <input

          name="name"

          placeholder="Product Name"

          value={product.name}

          onChange={handleChange}

          required

        />

        {/* 💰 PRICE */}
        <input

          name="price"

          placeholder="Price"

          value={product.price}

          onChange={handleChange}

          required

        />

        {/* 🏷️ CATEGORY */}
        <select

          name="category"

          value={product.category}

          onChange={handleChange}

          required

        >

          <option value="">
            Select Category
          </option>

          {categories.map((cat, index) => (

            <option
              key={index}
              value={cat}
            >

              {cat}

            </option>

          ))}

        </select>

        {/* ✍️ CUSTOM CATEGORY */}
        {product.category ===
          "Others" && (

          <input

            placeholder="Enter custom category"

            value={customCategory}

            onChange={(e) =>
              setCustomCategory(
                e.target.value
              )
            }

            required

          />

        )}

        {/* 📝 DESCRIPTION */}
        <textarea

          name="description"

          placeholder="Write product description..."

          value={product.description}

          onChange={handleChange}

          required

        ></textarea>

        {/* 🚀 BUTTON */}
        <button
          type="submit"
          className="btn-rent"
        >

          Add Product

        </button>

      </form>

    </div>

  );

}

export default AddProduct;