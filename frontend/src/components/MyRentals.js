import React, {
  useEffect,
  useState
} from "react";

import axios from "axios";

import {
  io
} from "socket.io-client";

import "../App.css";

// 🔔 SOCKET CONNECTION
const socket =
  io("");

function MyRentals() {

  const [products, setProducts] =
    useState([]);

  const [rentals, setRentals] =
    useState([]);

  const [activeTab,
    setActiveTab] =
    useState("listed");

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  // =====================================================
  // 🔄 FETCH DATA
  // =====================================================

  useEffect(() => {

    fetchProducts();

    fetchRentals();

    // 🔔 NEW PAID BOOKING
    socket.on(
      "newRequest",
      () => {
        fetchRentals();
      }
    );

    // 🔔 BOOKING ACCEPTED
    socket.on(
      "bookingAccepted",
      () => {
        fetchRentals();
        fetchProducts();
      }
    );

    // 🔔 BOOKING REJECTED
    socket.on(
      "bookingRejected",
      () => {
        fetchRentals();
        fetchProducts();
      }
    );

    return () => {

      socket.off("newRequest");

      socket.off("bookingAccepted");

      socket.off("bookingRejected");

    };

  }, []);

  // =====================================================
  // 📦 FETCH PRODUCTS
  // =====================================================

  const fetchProducts = () => {

    axios.get(
      "/api/products"
    )

    .then((res) => {

      setProducts(res.data);

    })

    .catch((err) => {

      console.log(err);

    });

  };

  // =====================================================
  // 📅 FETCH RENTALS
  // =====================================================

  const fetchRentals = () => {

    axios.get(
      "/api/rent"
    )

    .then((res) => {

      setRentals(res.data);

    })

    .catch((err) => {

      console.log(err);

    });

  };

  // =====================================================
  // 👑 MY PRODUCTS
  // =====================================================

  const myProducts =
    products.filter(

      (p) =>

        p.ownerEmail
          ?.trim()
          .toLowerCase()

        ===

        user?.email
          ?.trim()
          .toLowerCase()

    );

  // =====================================================
  // 🛒 CURRENT RENTALS
  // =====================================================
  // Only ACCEPTED bookings are active rentals.

  const myRented =
    rentals.filter(

      (r) =>

        r.userEmail
          ?.trim()
          .toLowerCase()

        ===

        user?.email
          ?.trim()
          .toLowerCase()

        &&

        r.status === "Accepted"

    );

  // =====================================================
  // 📜 BOOKING HISTORY
  // =====================================================
  // Includes payment waiting + final decisions.

  const bookingHistory =
    rentals.filter(

      (r) => {

        const isMyBooking =

          r.userEmail
            ?.trim()
            .toLowerCase()

          ===

          user?.email
            ?.trim()
            .toLowerCase();

        if (!isMyBooking) {
          return false;
        }

        return (

          r.status === "Paid" ||

          r.status === "Accepted" ||

          r.status === "Rejected" ||

          r.status === "Refunded"

        );

      }

    );

  // =====================================================
  // 🔍 PRODUCT DETAILS
  // =====================================================

  const getProductDetails = (
    productId
  ) => {

    return products.find(

      (p) =>

        String(p._id)

        ===

        String(productId)

    );

  };

  // =====================================================
  // 📊 OWNER BOOKING REQUESTS
  // =====================================================
  // Owner sees:
  // Paid → Accept / Reject
  // Accepted → Accepted
  // Rejected → Rejected
  // Refunded → Refunded

  const ownerRequests =
    rentals.filter(

      (r) => {

        const isOwner =

          r.ownerEmail
            ?.trim()
            .toLowerCase()

          ===

          user?.email
            ?.trim()
            .toLowerCase();

        return isOwner;

      }

    );

  // =====================================================
  // 📊 PENDING OWNER DECISIONS
  // =====================================================

  const pendingRequests =
    ownerRequests.filter(

      (r) =>

        r.status === "Paid"

    );

  // =====================================================
  // ✅ ACCEPT / ❌ REJECT
  // =====================================================

  const updateStatus = (
    id,
    status
  ) => {

    const actionText =
      status === "Accepted"
        ? "accept this booking?"
        : "reject this booking and initiate refund?";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${actionText}`
      );

    if (!confirmed) {
      return;
    }

    axios.put(

      `/api/rent/${id}`,

      {
        status
      }

    )

    .then((res) => {

      alert(
        res.data.message ||
        `Request ${status} successfully ✅`
      );

      fetchRentals();

      fetchProducts();

    })

    .catch((err) => {

      console.log(err);

      alert(

        err.response?.data?.message ||

        "Unable to update booking ❌"

      );

    });

  };

  // =====================================================
  // ❌ DELETE REQUEST
  // =====================================================

  const deleteRental = (
    id
  ) => {

    const confirmed =
      window.confirm(
        "Delete this rental request? ❌"
      );

    if (!confirmed) {
      return;
    }

    axios.delete(

      `/api/rent/${id}`

    )

    .then(() => {

      alert(
        "Request Deleted ✅"
      );

      fetchRentals();

    })

    .catch((err) => {

      console.log(err);

      alert(
        "Unable to delete request ❌"
      );

    });

  };

  // =====================================================
  // ❌ DELETE PRODUCT
  // =====================================================

  const deleteProduct = (
    id
  ) => {

    const confirmDelete =
      window.confirm(
        "Delete this product? ❌"
      );

    if (!confirmDelete) {
      return;
    }

    axios.delete(

      `/api/products/${id}`

    )

    .then(() => {

      alert(
        "Product Deleted ✅"
      );

      fetchProducts();

    })

    .catch((err) => {

      console.log(err);

      alert(
        "Unable to delete product ❌"
      );

    });

  };

  // =====================================================
  // 🎨 STATUS DISPLAY
  // =====================================================

  const getStatusText = (
    status
  ) => {

    if (status === "Paid") {

      return (
        <p className="accepted-text">
          💳 Payment Received ✅
          <br />
          ⏳ Waiting for Owner Decision
        </p>
      );

    }

    if (status === "Accepted") {

      return (
        <p className="accepted-text">
          Booking Accepted ✅
        </p>
      );

    }

    if (status === "Rejected") {

      return (
        <p className="rejected-text">
          Booking Rejected ❌
        </p>
      );

    }

    if (status === "Refunded") {

      return (
        <p className="accepted-text">
          Booking Rejected
          <br />
          💰 Payment Refunded
        </p>
      );

    }

    return (
      <p>
        Status: {status}
      </p>
    );

  };

  // =====================================================
  // 🚀 RETURN
  // =====================================================

  return (

    <div className="container fade-in rentals-page">

      {/* 🚀 HEADER */}

      <div className="rentals-header">

        <h1>
          Rental Dashboard 🚀
        </h1>

        <p>
          Manage your listings,
          bookings and rentals
          easily
        </p>

      </div>


      {/* 📊 STATS */}

      <div className="stats-grid">

        <div className="stats-card">

          <h2>
            {myProducts.length}
          </h2>

          <p>
            Products Listed
          </p>

        </div>


        <div className="stats-card">

          <h2>
            {myRented.length}
          </h2>

          <p>
            Current Rentals
          </p>

        </div>


        <div className="stats-card">

          <h2>
            {bookingHistory.length}
          </h2>

          <p>
            Booking History
          </p>

        </div>


        <div className="stats-card">

          <h2>
            {pendingRequests.length}
          </h2>

          <p>
            Pending Requests
          </p>

        </div>

      </div>


      {/* 🔘 TABS */}

      <div className="tabs">

        <button

          className={
            activeTab === "listed"
              ? "active-tab"
              : ""
          }

          onClick={() =>
            setActiveTab("listed")
          }

        >

          📦 Products Listed

        </button>


        <button

          className={
            activeTab === "rented"
              ? "active-tab"
              : ""
          }

          onClick={() =>
            setActiveTab("rented")
          }

        >

          🛒 Current Rentals

        </button>


        <button

          className={
            activeTab === "history"
              ? "active-tab"
              : ""
          }

          onClick={() =>
            setActiveTab("history")
          }

        >

          📜 Booking History

        </button>

      </div>


      {/* =================================================
          👑 OWNER PRODUCTS
      ================================================= */}

      {activeTab ===
      "listed" && (

        <div className="grid">

          {myProducts.length === 0 ? (

            <p>
              No products listed yet
            </p>

          ) : (

            myProducts.map((p) => {

              const requests =
                ownerRequests.filter(

                  (r) =>

                    String(r.productId)

                    ===

                    String(p._id)

                );

              return (

                <div
                  className="card"
                  key={p._id}
                >

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


                  <p>

                    Status:
                    {" "}

                    <strong>

                      {p.status ||
                        "Available"}

                    </strong>

                  </p>


                  {/* ❌ DELETE */}

                  <button

                    className="btn-reject"

                    onClick={() =>
                      deleteProduct(
                        p._id
                      )
                    }

                  >

                    Delete Product

                  </button>


                  {/* 🔥 REQUESTS */}

                  <div className="request-box">

                    <h4>
                      Booking Requests
                    </h4>


                    {requests.length === 0 ? (

                      <p>
                        No requests yet
                      </p>

                    ) : (

                      requests.map((req) => (

                        <div
                          key={req._id}
                          className="request-item"
                        >

                          <p>

                            👤
                            {" "}
                            {req.userEmail}

                          </p>


                          <p>

                            📅
                            {" "}

                            {
                              new Date(
                                req.startDate
                              ).toLocaleDateString()
                            }

                            {" "}
                            -

                            {" "}

                            {
                              new Date(
                                req.endDate
                              ).toLocaleDateString()
                            }

                          </p>


                          {/* 💰 AMOUNT */}

                          {req.amount && (

                            <p>

                              💰 Amount Paid:
                              {" "}
                              ₹{req.amount}

                            </p>

                          )}


                          {/* 💳 PAID */}

                          {req.status ===
                          "Paid" && (

                            <>

                              <p className="accepted-text">

                                💳 Payment Received ✅

                              </p>

                              <p>

                                ⏳ Waiting for your
                                decision

                              </p>


                              <div className="owner-actions">

                                <button

                                  className="btn-accept"

                                  onClick={() =>

                                    updateStatus(
                                      req._id,
                                      "Accepted"
                                    )

                                  }

                                >

                                  Accept

                                </button>


                                <button

                                  className="btn-reject"

                                  onClick={() =>

                                    updateStatus(
                                      req._id,
                                      "Rejected"
                                    )

                                  }

                                >

                                  Reject & Refund

                                </button>

                              </div>

                            </>

                          )}


                          {/* ✅ ACCEPTED */}

                          {req.status ===
                          "Accepted" && (

                            <p className="accepted-text">

                              Booking Accepted ✅

                            </p>

                          )}


                          {/* ❌ REJECTED */}

                          {req.status ===
                          "Rejected" && (

                            <p className="rejected-text">

                              Booking Rejected ❌

                            </p>

                          )}


                          {/* 💰 REFUNDED */}

                          {req.status ===
                          "Refunded" && (

                            <p className="accepted-text">

                              Booking Rejected
                              <br />
                              💰 Payment Refunded

                            </p>

                          )}

                        </div>

                      ))

                    )}

                  </div>

                </div>

              );

            })

          )}

        </div>

      )}


      {/* =================================================
          🛒 CURRENT RENTALS
      ================================================= */}

      {activeTab ===
      "rented" && (

        <div className="grid">

          {myRented.length === 0 ? (

            <p>
              No current rentals
            </p>

          ) : (

            myRented.map((r) => {

              const product =
                getProductDetails(
                  r.productId
                );

              return (

                <div
                  className="card"
                  key={r._id}
                >

                  {product ? (

                    <>

                      <img
                        src={product.image}
                        alt={product.name}
                      />

                      <h3>
                        {product.name}
                      </h3>

                      <p className="price">
                        ₹{product.price}
                      </p>

                    </>

                  ) : (

                    <h3>
                      Product not found
                    </h3>

                  )}


                  <p>

                    Status:
                    {" "}

                    <strong>
                      Accepted
                    </strong>

                  </p>


                  <p>

                    📅
                    {" "}

                    {
                      new Date(
                        r.startDate
                      ).toLocaleDateString()
                    }

                    {" "}
                    -

                    {" "}

                    {
                      new Date(
                        r.endDate
                      ).toLocaleDateString()
                    }

                  </p>


                  <button

                    className="btn-reject"

                    onClick={() =>
                      deleteRental(
                        r._id
                      )
                    }

                  >

                    Delete Request

                  </button>

                </div>

              );

            })

          )}

        </div>

      )}


      {/* =================================================
          📜 BOOKING HISTORY
      ================================================= */}

      {activeTab ===
      "history" && (

        <div className="grid">

          {bookingHistory.length === 0 ? (

            <p>
              No booking history yet
            </p>

          ) : (

            bookingHistory.map((r) => {

              const product =
                getProductDetails(
                  r.productId
                );

              return (

                <div
                  className="card"
                  key={r._id}
                >

                  {product ? (

                    <>

                      <img
                        src={product.image}
                        alt={product.name}
                      />

                      <h3>
                        {product.name}
                      </h3>

                      <p className="price">
                        ₹{product.price}
                      </p>

                    </>

                  ) : (

                    <h3>
                      Product not found
                    </h3>

                  )}


                  {/* STATUS */}

                  <p>

                    Status:
                    {" "}

                    <strong>
                      {r.status}
                    </strong>

                  </p>


                  {/* 💳 PAYMENT INFO */}

                  {r.status ===
                  "Paid" && (

                    <p className="accepted-text">

                      💳 Payment Successful ✅
                      <br />
                      ⏳ Waiting for Owner Decision

                    </p>

                  )}


                  {r.status ===
                  "Accepted" && (

                    <p className="accepted-text">

                      Booking Accepted ✅

                    </p>

                  )}


                  {r.status ===
                  "Rejected" && (

                    <p className="rejected-text">

                      Booking Rejected ❌

                    </p>

                  )}


                  {r.status ===
                  "Refunded" && (

                    <p className="accepted-text">

                      Booking Rejected ❌
                      <br />
                      💰 Payment Refunded

                    </p>

                  )}


                  <p>

                    📅
                    {" "}

                    {
                      new Date(
                        r.startDate
                      ).toLocaleDateString()
                    }

                    {" "}
                    -

                    {" "}

                    {
                      new Date(
                        r.endDate
                      ).toLocaleDateString()
                    }

                  </p>


                  {r.amount && (

                    <p>

                      💰 Booking Amount:
                      {" "}
                      ₹{r.amount}

                    </p>

                  )}

                </div>

              );

            })

          )}

        </div>

      )}

    </div>

  );

}

export default MyRentals;