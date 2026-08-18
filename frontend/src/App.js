import React from "react";

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

// 🔥 TOAST
import {
  Toaster
} from "react-hot-toast";

// 🔥 COMPONENTS
import Navbar from "./components/Navbar";

import Footer from "./components/Footer";

import Home from "./components/Home";

import AddProduct from "./components/AddProduct";

import Login from "./components/Login";

import Profile from "./components/Profile";

import Register from "./components/Register";

import MyRentals from "./components/MyRentals";

import Messages from "./components/Messages";

import Support from "./components/Support";


// ✅ PRODUCT DETAILS
import ProductDetails from "./components/ProductDetails";

function App() {

  return (

    <BrowserRouter>

      {/* 🔥 GLOBAL TOAST */}
      <Toaster

        position="top-right"

        toastOptions={{

          style: {

            background:
              "rgba(15,23,42,0.95)",

            color: "#fff",

            border:
              "1px solid rgba(255,255,255,0.08)",

            borderRadius: "16px",

            padding: "14px",

            backdropFilter:
              "blur(10px)"

          },

          success: {

            iconTheme: {

              primary: "#22c55e",

              secondary: "#fff"

            }

          },

          error: {

            iconTheme: {

              primary: "#ef4444",

              secondary: "#fff"

            }

          }

        }}

      />

      {/* 🔥 NAVBAR */}
      <Navbar />

      {/* 🚀 ROUTES */}
      <Routes>

        {/* 🏠 HOME */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* ➕ ADD PRODUCT */}
        <Route
          path="/add"
          element={<AddProduct />}
        />

        {/* 🔐 LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* 📝 REGISTER */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* 👤 PROFILE */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* 📦 RENTALS */}
        <Route
          path="/rentals"
          element={<MyRentals />}
        />

        {/* 💬 MESSAGES */}
        <Route
          path="/messages"
          element={<Messages />}
        />

        {/* 🛟 SUPPORT */}
        <Route
          path="/support"
          element={<Support />}
        />

        {/* 🔥 PRODUCT DETAILS */}
        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

      </Routes>

      {/* 🔥 FOOTER */}
      <Footer />

    </BrowserRouter>

  );

}

export default App;