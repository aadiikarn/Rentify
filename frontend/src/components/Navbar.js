import React, {
  useEffect,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import axios from "axios";

import {
  io
} from "socket.io-client";

import "./Navbar.css";

// 🔥 SOCKET CONNECTION
const socket =
  io("http://localhost:5000");

function Navbar() {

  const storedUser =
    localStorage.getItem("user");

  const user =
    storedUser
      ? JSON.parse(storedUser)
      : null;

  const [notifications,
    setNotifications] =
    useState([]);

  const [showPanel,
    setShowPanel] =
    useState(false);

  // 🔔 FETCH REQUESTS
  const fetchNotifications = () => {

    if (!user) return;

    axios.get(
      "http://localhost:5000/api/rent"
    )

    .then((res) => {

      const pendingRequests =
        res.data.filter(

          (r) =>

            r.ownerEmail ===
            user.email &&

            r.status ===
            "Pending"

        );

      setNotifications(
        pendingRequests
      );

    })

    .catch((err) => {

      console.log(err);

    });

  };

  // 🔥 INITIAL FETCH
  useEffect(() => {

    fetchNotifications();

  }, []);

  // 🔥 REALTIME LISTENER
  useEffect(() => {

    socket.on(

      "newRequest",

      () => {

        fetchNotifications();

      }

    );

    return () => {

      socket.off(
        "newRequest"
      );

    };

  }, []);

  // 🚪 LOGOUT
  const logout = () => {

    localStorage.removeItem(
      "user"
    );

    window.location.href = "/";

  };

  return (

    <div className="navbar">

      {/* 🔥 LOGO */}
      <div className="logo-container">

        <img
          src="https://cdn-icons-png.flaticon.com/512/891/891462.png"
          alt="logo"
          className="logo-img"
        />

        <div>

          <span className="logo-text">
            Rentify
          </span>

        </div>

      </div>

      {/* 🔗 NAV LINKS */}
      <div className="nav-links">

        {/* 🏠 HOME */}
        <Link to="/">
          Home
        </Link>

        {user ? (

          <>

            {/* ➕ ADD PRODUCT */}
            <Link to="/add">
              Add Product
            </Link>

            {/* 🔔 NOTIFICATION */}
            <div className="notification-wrapper">

              <div
                className="notification-link"
                onClick={() =>
                  setShowPanel(!showPanel)
                }
              >

                🔔

                {notifications.length > 0 && (

                  <span className="notification-badge">

                    {notifications.length}

                  </span>

                )}

              </div>

              {/* 🔥 DROPDOWN */}
              {showPanel && (

                <div className="notification-panel">

                  <h4>
                    Booking Requests
                  </h4>

                  {notifications.length === 0 ? (

                    <p>
                      No new requests
                    </p>

                  ) : (

                    notifications.map((n) => (

                      <div
                        className="notification-item"
                        key={n._id}
                      >

                        <p>

                          {n.userEmail}

                          {" "}
                          requested your product

                        </p>

                      </div>

                    ))

                  )}

                  <Link
                    to="/rentals"
                    className="view-all-btn"
                  >

                    View All

                  </Link>

                </div>

              )}

            </div>

            {/* 📦 RENTALS */}
            <Link to="/rentals">
              My Rentals
            </Link>

            {/* 💬 MESSAGES */}
            <Link to="/messages">
              Messages
            </Link>

            {/* 👤 PROFILE */}
            <Link to="/profile">
              Profile
            </Link>

            {/* 👤 USER */}
            <span className="user-name">

              {user.name ||
                user.email}

            </span>

            {/* 🚪 LOGOUT */}
            <span
              onClick={logout}
              className="logout-btn"
            >

              Logout

            </span>

          </>

        ) : (

          <>

            {/* 🔐 LOGIN */}
            <Link to="/login">
              Login
            </Link>

            {/* 📝 REGISTER */}
            <Link to="/register">
              Register
            </Link>

          </>

        )}

      </div>

    </div>

  );

}

export default Navbar;