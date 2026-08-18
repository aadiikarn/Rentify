import React from "react";

import {
  Link
} from "react-router-dom";

import "../App.css";

function Footer() {

  return (

    <footer className="footer">

      {/* 🔥 TOP */}
      <div className="footer-container">

        {/* 🚀 BRAND */}
        <div className="footer-section">

          <h2>
            Rentify
          </h2>

          <p>

            Smart rental marketplace
            for electronics, gadgets,
            bikes, cameras and more.

          </p>

        </div>

        {/* 🔗 QUICK LINKS */}
        <div className="footer-section">

          <h3>
            Quick Links
          </h3>

          <Link to="/">
            Home
          </Link>

          <Link to="/add">
            Add Product
          </Link>

          <Link to="/rentals">
            My Rentals
          </Link>

          <Link to="/messages">
            Messages
          </Link>

        </div>

        {/* 🛟 SUPPORT */}
        <div className="footer-section">

          <h3>
            Help & Support
          </h3>

          <Link to="/support">
            FAQs
          </Link>

          <Link to="/support">
            Contact Support
          </Link>
<a
  href="mailto:rentify.support@gmail.com"
  className="support-mail"
>

  📧 rentify.support@gmail.com

</a>

        </div>

      </div>

      {/* 🔥 BOTTOM */}
      <div className="footer-bottom">

        © 2026 Rentify.
        All Rights Reserved.

      </div>

    </footer>

  );

}

export default Footer;