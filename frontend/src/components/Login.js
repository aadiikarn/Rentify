import React, {
  useState
} from "react";

import axios from "axios";

import toast from "react-hot-toast";

import "./Auth.css";

function Login() {

  const [user,
    setUser] =
    useState({

      email: "",
      password: ""

    });

  // 🔄 LOADING STATE
  const [loading,
    setLoading] =
    useState(false);

  // ✍ INPUT CHANGE
  const handleChange = (e) => {

    setUser({

      ...user,

      [e.target.name]:
        e.target.value

    });

  };

  // 🔐 LOGIN
  const handleLogin = (e) => {

    e.preventDefault();

    // 🚀 START LOADING
    setLoading(true);

    axios.post(

      "http://localhost:5000/api/auth/login",

      user

    )

    .then((res) => {

      localStorage.setItem(

        "user",

        JSON.stringify(res.data)

      );

      toast.success(
        "Login Successful ✅"
      );

      window.location.href = "/";

    })

    .catch(() => {

      toast.error(
        "Invalid Credentials ❌"
      );

    })

    .finally(() => {

      // ✅ STOP LOADING
      setLoading(false);

    });

  };

  return (

    <div className="auth-container">

      <form

        className="auth-form"

        onSubmit={handleLogin}

      >

        {/* 🔥 TITLE */}
        <h2>
          Login
        </h2>

        {/* 📧 EMAIL */}
        <input

          name="email"

          placeholder="Email"

          onChange={handleChange}

          required

        />

        {/* 🔑 PASSWORD */}
        <input

          name="password"

          type="password"

          placeholder="Password"

          onChange={handleChange}

          required

        />

        {/* 🚀 BUTTON */}
        <button

          type="submit"

          disabled={loading}

          className={
            loading
              ? "loading-btn"
              : ""
          }

        >

          {loading
            ? "Logging in..."
            : "Login"}

        </button>

        {/* 🔗 REGISTER */}
        <p style={{
          marginTop: "10px"
        }}>

          Don't have an account?
          {" "}

          <a href="/register">

            Sign Up

          </a>

        </p>

      </form>

    </div>

  );

}

export default Login;