import React from "react";

import "./LoginPopup.css";

function LoginPopup({

  show,
  onClose

}) {

  if (!show) return null;

  return (

    <div className="popup-overlay">

      <div className="popup-box">

        {/* 🔒 TITLE */}
        <h2 className="popup-title">

          🔒 Login Required

        </h2>

        {/* 📝 TEXT */}
        <p className="popup-text">

          Please login before
          viewing product details
          or adding products.

        </p>

        {/* 🚀 BUTTONS */}
        <div className="popup-actions">

          <button

            className="popup-login-btn"

            onClick={() =>
              window.location.href =
                "/login"
            }

          >

            Login

          </button>

          <button

            className="popup-btn"

            onClick={onClose}

          >

            Cancel

          </button>

        </div>

      </div>

    </div>

  );

}

export default LoginPopup;