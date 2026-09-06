import React, {
  useEffect,
  useState
} from "react";

import axios from "axios";

import {
  Link
} from "react-router-dom";

import "../App.css";

import LoginPopup from "./LoginPopup";

function Home() {

  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [selectedCategory,
    setSelectedCategory] =
    useState("All");

  const [showPopup,
    setShowPopup] =
    useState(false);

  const [showDropdown,
    setShowDropdown] =
    useState(false);

  // 🚀 NEW FILTER STATES
  const [sortBy,
    setSortBy] =
    useState("");

  const [priceFilter,
    setPriceFilter] =
    useState("All");

  const [availabilityFilter,
    setAvailabilityFilter] =
    useState(false);

  const storedUser =
    JSON.parse(
      localStorage.getItem("user")
    );

  // 🏷️ CATEGORIES
  const categories = [

    "All",
    "Electronics",
    "Sports",
    "Vehicles",
    "Furniture",
    "Books",
    "Clothing",
    "Mobiles",
    "Beauty",
    "Appliances",
    "Toys",
    "Food",
    "Accessories",
    "Shoes",
    "Gaming",
    "Cameras",
    "Tools",
    "Bags",
    "Music",
    "Others"

  ];

  // 🔥 SPLIT
  const mainCategories =
    categories.slice(0, 7);

  const extraCategories =
    categories.slice(7);

  // 🎯 CATEGORY ICONS
  const getIcon = (cat) => {

    switch (cat) {

      case "Electronics":
        return "💻";

      case "Sports":
        return "🏏";

      case "Vehicles":
        return "🚗";

      case "Furniture":
        return "🪑";

      case "Books":
        return "📚";

      case "Clothing":
        return "👕";

      case "Mobiles":
        return "📱";

      case "Beauty":
        return "💄";

      case "Appliances":
        return "📺";

      case "Toys":
        return "🧸";

      case "Food":
        return "🍔";

      case "Accessories":
        return "🎧";

      case "Shoes":
        return "👟";

      case "Gaming":
        return "🎮";

      case "Cameras":
        return "📷";

      case "Tools":
        return "🛠️";

      case "Bags":
        return "🎒";

      case "Music":
        return "🎵";

      default:
        return "⭐";

    }

  };

  // 🔄 FETCH PRODUCTS
  useEffect(() => {

    axios.get(
      "/api/products"
    )

    .then((res) => {

      setProducts(res.data);

    })

    .catch((err) => {

      console.log(err);

    });

  }, []);

  // 🚀 FILTER + SORT
  const filteredProducts =
    products

    .filter((p) => {

      // 🔍 SEARCH
      const matchSearch =

        p.name.toLowerCase()
        .includes(
          search.toLowerCase()
        );

      // 🏷 CATEGORY
      const matchCategory =

        selectedCategory ===
        "All" ||

        p.category ===
        selectedCategory;

      // 💰 PRICE
      let matchPrice = true;

      if (
        priceFilter ===
        "Under500"
      ) {

        matchPrice =
          p.price < 500;

      }

      else if (
        priceFilter ===
        "500to2000"
      ) {

        matchPrice =
          p.price >= 500 &&
          p.price <= 2000;

      }

      else if (
        priceFilter ===
        "Above2000"
      ) {

        matchPrice =
          p.price > 2000;

      }

      // ✅ AVAILABILITY
      const matchAvailability =

        availabilityFilter

        ? p.status !==
          "Unavailable"

        : true;

      return (

        matchSearch &&
        matchCategory &&
        matchPrice &&
        matchAvailability

      );

    })

    // 🔥 SORT
    .sort((a, b) => {

      if (
        sortBy ===
        "lowToHigh"
      ) {

        return a.price - b.price;

      }

      else if (
        sortBy ===
        "highToLow"
      ) {

        return b.price - a.price;

      }

      return 0;

    });

  return (

    <div className="container fade-in">

      {/* 🔍 SEARCH */}
      <div className="search-container">

        <span className="search-icon">
          🔍
        </span>

        <input

          type="text"

          placeholder="Search Products"

          className="search-input"

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

        />

      </div>

      {/* 🚀 FILTER BAR */}
      <div className="filter-bar">

        {/* 💰 PRICE */}
        <select

          value={priceFilter}

          onChange={(e) =>
            setPriceFilter(
              e.target.value
            )
          }

        >

          <option value="All">

            All Prices

          </option>

          <option value="Under500">

            Under ₹500

          </option>

          <option value="500to2000">

            ₹500 - ₹2000

          </option>

          <option value="Above2000">

            Above ₹2000

          </option>

        </select>

        {/* 🔥 SORT */}
        <select

          value={sortBy}

          onChange={(e) =>
            setSortBy(
              e.target.value
            )
          }

        >

          <option value="">
            Sort By
          </option>

          <option value="lowToHigh">

            Price Low → High

          </option>

          <option value="highToLow">

            Price High → Low

          </option>

        </select>

        {/* ✅ AVAILABLE */}
        <label className="availability-check">

          <input

            type="checkbox"

            checked={
              availabilityFilter
            }

            onChange={(e) =>
              setAvailabilityFilter(
                e.target.checked
              )
            }

          />

          Available Only

        </label>

      </div>

      {/* 🏷️ CATEGORY BAR */}
      <div className="category-bar">

        {mainCategories.map((cat) => (

          <div

            key={cat}

            className={`category-card ${
              selectedCategory === cat
                ? "active"
                : ""
            }`}

            onClick={() =>
              setSelectedCategory(cat)
            }

          >

            <span className="category-icon">

              {getIcon(cat)}

            </span>

            <p>
              {cat}
            </p>

          </div>

        ))}

        {/* MORE */}
        <div

          className="category-card more-btn"

          onClick={() =>
            setShowDropdown(
              !showDropdown
            )
          }

        >

          <span className="category-icon">

            ⋯

          </span>

          <p>
            More
          </p>

        </div>

        {/* DROPDOWN */}
        {showDropdown && (

          <div className="dropdown-menu">

            {extraCategories.map((cat) => (

              <div

                key={cat}

                className="dropdown-item"

                onClick={() => {

                  setSelectedCategory(cat);

                  setShowDropdown(false);

                }}

              >

                {cat}

              </div>

            ))}

          </div>

        )}

      </div>

      {/* 📦 PRODUCTS */}
      <div className="grid">

        {filteredProducts.length === 0 ? (

          <h2
            style={{
              textAlign: "center",
              width: "100%"
            }}
          >

            No Products Found ❌

          </h2>

        ) : (

          filteredProducts.map((p) => (
<Link

  to={
    storedUser
      ? `/product/${p._id}`
      : "#"
  }

  className="product-link"

  key={p._id}

  onClick={(e) => {

    if (!storedUser) {

      e.preventDefault();

      setShowPopup(true);

    }

  }}

>

              <div className="card">

                <img
                  src={p.image}
                  alt={p.name}
                />

                <h3>
                  {p.name}
                </h3>

                <p className="price">

                  ₹{p.price}

                </p>

                {/* 🔥 STATUS */}
                {storedUser &&
                storedUser.email ===
                p.ownerEmail ? (

                  <button className="btn-unavailable">

                    Your Product

                  </button>

                ) : p.status ===
                  "Unavailable" ? (

                  <button className="btn-unavailable">

                    Unavailable

                  </button>

                ) : (

                  <button className="btn-rent">

                    View Details

                  </button>

                )}

              </div>

            </Link>

          ))

        )}

      </div>

      {/* 🔥 LOGIN POPUP */}
      <LoginPopup

        show={showPopup}

        onClose={() =>
          setShowPopup(false)
        }

      />

    </div>

  );

}

export default Home;