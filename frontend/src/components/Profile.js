import React, {
  useState,
  useEffect
} from "react";

import axios from "axios";

import "../App.css";

function Profile() {

  const storedUser =
    JSON.parse(
      localStorage.getItem("user")
    );

  const [form, setForm] =
    useState(storedUser);

  const [edit, setEdit] =
    useState(false);

  // 🔄 IMAGE LOADING
  const [uploading,
    setUploading] =
    useState(false);

  // 📊 STATS
  const [stats, setStats] =
    useState({

      products: 0,
      rentals: 0

    });

  // 🔄 FETCH STATS
  useEffect(() => {

    fetchStats();

  }, []);

  const fetchStats = () => {

    // 📦 PRODUCTS
    axios.get(
      "http://localhost:5000/api/products"
    )

    .then((res) => {

      const myProducts =
        res.data.filter(

          (p) =>

            p.ownerEmail ===
            storedUser.email

        );

      // 🛒 RENTALS
      axios.get(
        "http://localhost:5000/api/rent"
      )

      .then((rentRes) => {

        const myRentals =
          rentRes.data.filter(

            (r) =>

              r.userEmail ===
              storedUser.email

          );

        setStats({

          products:
            myProducts.length,

          rentals:
            myRentals.length

        });

      });

    })

    .catch((err) => {

      console.log(err);

    });

  };

  // ✍ INPUT CHANGE
  const handleChange = (
    e
  ) => {

    setForm({

      ...form,

      [e.target.name]:
        e.target.value

    });

  };

  // ☁️ CLOUDINARY IMAGE UPLOAD
  const handleImage = async (
    e
  ) => {

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
      setForm({

        ...form,

        image:
          res.data.secure_url

      });

      alert(
        "Profile Image Uploaded ✅"
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

  // 💾 SAVE PROFILE
  const saveProfile = () => {

    axios.put(

      "http://localhost:5000/api/auth/update",

      form

    )

    .then((res) => {

      localStorage.setItem(

        "user",

        JSON.stringify(
          res.data
        )

      );

      alert(
        "Profile Updated ✅"
      );

      setEdit(false);

    })

    .catch((err) => {

      console.log(err);

    });

  };

  return (

    <div className="profile-page fade-in">

      {/* 👤 PROFILE CARD */}
      <div className="profile-card">

        {/* 🖼 IMAGE */}
        <img

          src={
            form?.image ||

            "https://via.placeholder.com/150"
          }

          alt="profile"

          className="profile-image"

        />

        {/* 👤 NAME */}
        <h1>

          {form.name}

        </h1>

        <p className="profile-email">

          {form.email}

        </p>

        {/* 📊 STATS */}
        <div className="profile-stats">

          <div className="profile-stat-box">

            <h2>
              {stats.products}
            </h2>

            <p>
              Products
            </p>

          </div>

          <div className="profile-stat-box">

            <h2>
              {stats.rentals}
            </h2>

            <p>
              Rentals
            </p>

          </div>

        </div>

      </div>

      {/* ✍ PROFILE DETAILS */}
      <div className="profile-details">

        <h2>

          {edit

            ? "Edit Profile ✏️"

            : "Profile Details"}

        </h2>

        {edit ? (

          <div className="profile-form">

            {/* 📸 IMAGE INPUT */}
            <input

              type="file"

              accept=".jpg,.jpeg,.png,.webp"

              onChange={handleImage}

            />

            {/* 🔄 UPLOADING */}
            {uploading && (

              <p>

                Uploading image...

              </p>

            )}

            {/* 👤 NAME */}
            <input

              name="name"

              value={form.name}

              onChange={handleChange}

              placeholder="Name"

            />

            {/* 📧 EMAIL */}
            <input

              name="email"

              value={form.email}

              onChange={handleChange}

              placeholder="Email"

            />

            {/* 🏠 ADDRESS */}
            <input

              name="address"

              value={form.address}

              onChange={handleChange}

              placeholder="Address"

            />

            {/* 📱 PHONE */}
            <input

              name="phone"

              value={form.phone}

              onChange={handleChange}

              placeholder="Phone"

            />

            {/* 💾 SAVE */}
            <button
              className="btn-rent"
              onClick={saveProfile}
            >

              Save Profile

            </button>

          </div>

        ) : (

          <div className="profile-info">

            <p>

              <strong>
                👤 Name:
              </strong>

              {" "}

              {form.name}

            </p>

            <p>

              <strong>
                📧 Email:
              </strong>

              {" "}

              {form.email}

            </p>

            <p>

              <strong>
                🏠 Address:
              </strong>

              {" "}

              {form.address ||
                "Not Added"}

            </p>

            <p>

              <strong>
                📱 Phone:
              </strong>

              {" "}

              {form.phone ||
                "Not Added"}

            </p>

            {/* ✏️ EDIT */}
            <button

              className="btn-chat"

              onClick={() =>
                setEdit(true)
              }

            >

              Edit Profile

            </button>

          </div>

        )}

      </div>

    </div>

  );

}

export default Profile;