import React, {
  useState
} from "react";

import axios from "axios";

import "./Auth.css";

function Register() {

  const [user, setUser] =
    useState({

      name: "",
      email: "",
      password: ""

    });

  // ✍ INPUT CHANGE
  const handleChange = (e) => {

    setUser({

      ...user,

      [e.target.name]:
        e.target.value

    });

  };

  // 🚀 REGISTER
  const handleRegister = (e) => {

    e.preventDefault();

    axios.post(

      "http://localhost:5000/api/auth/register",

      user

    )

    .then((res) => {

      localStorage.setItem(

        "user",

        JSON.stringify(
          res.data
        )

      );

      alert(
        "Registered Successfully ✅"
      );

      window.location.href = "/";

    })

    .catch(() => {

      alert(
        "Error ❌"
      );

    });

  };

  return (

    <div className="auth-container">

      <form
        className="auth-form"
        onSubmit={handleRegister}
      >

        {/* 🔥 TITLE */}
        <h2>

          Create Account

        </h2>

        <p className="auth-subtitle">

          Join Rentify and start
          renting smarter 🚀

        </p>

        {/* 👤 NAME */}
        <input

          name="name"

          placeholder="Full Name"

          onChange={handleChange}

        />

        {/* 📧 EMAIL */}
        <input

          name="email"

          type="email"

          placeholder="Email Address"

          onChange={handleChange}

        />

        {/* 🔒 PASSWORD */}
        <input

          name="password"

          type="password"

          placeholder="Password"

          onChange={handleChange}

        />

        {/* 🚀 BUTTON */}
        <button type="submit">

          Create Account

        </button>

        {/* 🔗 LOGIN */}
        <p className="auth-switch">

          Already have an account?

          {" "}

          <a href="/login">

            Login

          </a>

        </p>

      </form>

    </div>

  );

}

export default Register;