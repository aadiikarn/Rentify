import React, {
  useEffect,
  useState
} from "react";

import {
  useParams
} from "react-router-dom";

import axios from "axios";

import "../App.css";

import BookingModal from "./BookingModal";

// 💬 CHAT
import ChatBox from "./ChatBox";


function ProductDetails() {

  const { id } = useParams();


  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  // 📅 BOOKING PANEL
  const [showBooking,
    setShowBooking] =
    useState(false);


  // 💬 CHAT PANEL
  const [showChat,
    setShowChat] =
    useState(false);


  // ⭐ REVIEWS
  const [reviews,
    setReviews] =
    useState([]);


  const [rating,
    setRating] =
    useState(5);


  const [comment,
    setComment] =
    useState("");


  const storedUser =
    JSON.parse(
      localStorage.getItem("user")
    );


  // =====================================================
  // 🔄 FETCH PRODUCT
  // =====================================================

  useEffect(() => {

    axios.get(
      "/api/products"
    )

      .then((res) => {

        const foundProduct =
          res.data.find(

            (p) =>
              String(p._id) ===
              String(id)

          );


        setProduct(
          foundProduct
        );


        setLoading(false);

      })

      .catch((err) => {

        console.log(err);

        setLoading(false);

      });


    fetchReviews();

  }, [id]);


  // =====================================================
  // ⭐ FETCH REVIEWS
  // =====================================================

  const fetchReviews = () => {

    axios.get(
      `/api/reviews/${id}`
    )

      .then((res) => {

        setReviews(
          res.data
        );

      })

      .catch((err) => {

        console.log(err);

      });

  };


  // =====================================================
  // ⭐ ADD REVIEW
  // =====================================================

  const submitReview = () => {

    if (!storedUser) {

      alert(
        "Login first ❌"
      );

      return;

    }


    if (!comment.trim()) {

      alert(
        "Write review first ❌"
      );

      return;

    }


    axios.post(

      "/api/reviews/add",

      {

        productId:
          id,

        userEmail:
          storedUser.email,

        rating:
          rating,

        comment:
          comment

      }

    )

      .then(() => {

        alert(
          "Review Added ✅"
        );


        setComment("");

        setRating(5);


        fetchReviews();

      })

      .catch((err) => {

        console.log(err);

      });

  };


  // =====================================================
  // ⭐ AVERAGE RATING
  // =====================================================

  const averageRating =
    reviews.length > 0

      ? (

        reviews.reduce(

          (acc, curr) =>
            acc + curr.rating,

          0

        ) / reviews.length

      ).toFixed(1)

      : 0;


  // =====================================================
  // ⏳ LOADING
  // =====================================================

  if (loading) {

    return (

      <div
        style={{
          padding: "50px",
          textAlign: "center",
          color: "white"
        }}
      >

        <h2>
          Loading Product...
        </h2>

      </div>

    );

  }


  // =====================================================
  // ❌ PRODUCT NOT FOUND
  // =====================================================

  if (!product) {

    return (

      <div
        style={{
          padding: "50px",
          textAlign: "center",
          color: "red"
        }}
      >

        <h1>
          Product Not Found ❌
        </h1>

      </div>

    );

  }


  // =====================================================
  // 💳 RENT + PAYMENT
  // =====================================================

  const rentProduct = async (
    bookingData
  ) => {

    // 🔒 LOGIN CHECK
    if (!storedUser) {

      alert(
        "Please login first ❌"
      );

      return;

    }


    // ❌ OWNER CHECK
    if (
      storedUser.email.toLowerCase() ===
      product.ownerEmail.toLowerCase()
    ) {

      alert(
        "This is your product ❌"
      );

      return;

    }


    try {

      // =================================================
      // 1️⃣ CREATE BOOKING
      // =================================================

      const bookingResponse =
        await axios.post(

          "/api/rent/rent",

          {

            productId:
              product._id,

            userEmail:
              storedUser.email,

            startDate:
              bookingData.startDate,

            endDate:
              bookingData.endDate,

            amount:
              bookingData.amount

          }

        );


      // 🔍 GET CREATED BOOKING
      const booking =
        bookingResponse.data.rent;


      if (!booking) {

        throw new Error(
          "Booking was not created"
        );

      }


      console.log(
        "Booking Created:",
        booking._id
      );


      // =================================================
      // 2️⃣ CREATE RAZORPAY ORDER
      // =================================================

      const orderResponse =
        await axios.post(

          "/api/payment/create-order",

          {

            amount:
              bookingData.amount

          }

        );


      if (
        !orderResponse.data.success
      ) {

        throw new Error(
          "Unable to create Razorpay order"
        );

      }


      const order =
        orderResponse.data.order;


      console.log(
        "Razorpay Order Created:",
        order.id
      );


      // =================================================
      // 3️⃣ CHECK RAZORPAY SCRIPT
      // =================================================

      if (!window.Razorpay) {

        alert(
          "Razorpay Checkout is not loaded ❌"
        );


        // Delete unpaid booking
        await axios.delete(

          `/api/rent/${booking._id}`

        );


        return;

      }


      // =================================================
      // 4️⃣ RAZORPAY CHECKOUT
      // =================================================

      const options = {

        key:
          process.env
            .REACT_APP_RAZORPAY_KEY_ID,

        amount:
          order.amount,

        currency:
          order.currency,

        name:
          "Rentify",

        description:
          `Rental for ${product.name}`,

        order_id:
          order.id,


        // =================================================
        // 💳 PAYMENT SUCCESS
        // =================================================

        handler:
          async function (
            response
          ) {

            try {

              console.log(
                "Razorpay Payment Response:",
                response
              );


              // =========================================
              // 5️⃣ VERIFY PAYMENT
              // =========================================

              const verifyResponse =
                await axios.post(

                  "/api/payment/verify-payment",

                  {

                    razorpay_order_id:
                      response.razorpay_order_id,

                    razorpay_payment_id:
                      response.razorpay_payment_id,

                    razorpay_signature:
                      response.razorpay_signature,

                    userEmail:
                      storedUser.email,

                    productId:
                      product._id,

                    bookingId:
                      booking._id,

                    amount:
                      bookingData.amount

                  }

                );


              if (
                verifyResponse.data.success
              ) {

                alert(
                  "Payment Successful! Booking sent to owner ✅"
                );


                setShowBooking(
                  false
                );

              }

              else {

                alert(
                  "Payment verification failed ❌"
                );

              }

            }

            catch (error) {

              console.log(
                "Payment Verification Error:",
                error
              );


              alert(
                error.response?.data?.message ||
                "Payment verification failed ❌"
              );

            }

          },


        // =================================================
        // 👤 PREFILL USER
        // =================================================

        prefill: {

          name:
            storedUser.name ||
            "",

          email:
            storedUser.email ||
            ""

        },


        // =================================================
        // 🎨 RAZORPAY THEME
        // =================================================

        theme: {

          color:
            "#3399cc"

        },


        // =================================================
        // ❌ PAYMENT CANCELLED
        // =================================================

        modal: {

          ondismiss:
            async function () {

              try {

                await axios.delete(

                  `/api/rent/${booking._id}`

                );

                console.log(
                  "Unpaid booking deleted"
                );

              }

              catch (error) {

                console.log(
                  "Booking cleanup error:",
                  error
                );

              }


              alert(
                "Payment cancelled. Booking was not created ❌"
              );

            }

        }

      };


      // =================================================
      // 🚀 OPEN RAZORPAY
      // =================================================

      const razorpay =
        new window.Razorpay(
          options
        );


      razorpay.open();

    }

    catch (error) {

      console.log(
        "BOOKING / PAYMENT ERROR:",
        error
      );


      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to start payment ❌";


      alert(
        message
      );

    }

  };


  // =====================================================
  // 🖥️ UI
  // =====================================================

  return (

    <div className="details-page">


      {/* 📦 LEFT SIDE */}

      <div className="details-left">

        <img
          src={product.image}
          alt={product.name}
          className="details-image"
        />

      </div>


      {/* 📄 RIGHT SIDE */}

      <div className="details-right">


        <h1>
          {product.name}
        </h1>


        {/* ⭐ RATING */}

        <h3 className="rating-text">

          ⭐ {averageRating}

          {" "}

          ({reviews.length} reviews)

        </h3>


        {/* 💰 PRICE */}

        <p className="details-price">

          ₹{product.price}/day

        </p>


        <p className="details-description">

          {product.description}

        </p>


        <p>

          <strong>
            Category:
          </strong>

          {" "}

          {product.category}

        </p>


        <p>

          <strong>
            Owner:
          </strong>

          {" "}

          {product.ownerEmail}

        </p>


        <p>

          <strong>
            Status:
          </strong>

          {" "}

          <span
            className={

              product.status ===
              "Unavailable"

                ? "red-status"

                : "green-status"

            }
          >

            {product.status}

          </span>

        </p>


        {/* 🔥 BUTTONS */}

        {
          product.status ===
          "Unavailable"

            ? (

              <button
                className="btn-unavailable"
              >

                Unavailable

              </button>

            )

            : (

              <>

                {/* 📅 RENT */}

                <button

                  className="btn-rent"

                  onClick={() =>
                    setShowBooking(
                      true
                    )
                  }

                >

                  Rent Now

                </button>


                {/* 💬 CHAT */}

                <button

                  className="btn-chat"

                  onClick={() =>
                    setShowChat(
                      true
                    )
                  }

                >

                  Chat With Owner

                </button>

              </>

            )
        }


        {/* ⭐ REVIEW FORM */}

        <div className="review-box">

          <h2>
            Add Review
          </h2>


          <select

            value={rating}

            onChange={(e) =>
              setRating(
                Number(
                  e.target.value
                )
              )
            }

          >

            <option value={5}>
              ⭐⭐⭐⭐⭐
            </option>

            <option value={4}>
              ⭐⭐⭐⭐
            </option>

            <option value={3}>
              ⭐⭐⭐
            </option>

            <option value={2}>
              ⭐⭐
            </option>

            <option value={1}>
              ⭐
            </option>

          </select>


          <textarea

            placeholder="Write review..."

            value={comment}

            onChange={(e) =>
              setComment(
                e.target.value
              )
            }

          />


          <button

            className="btn-rent"

            onClick={
              submitReview
            }

          >

            Submit Review

          </button>

        </div>


        {/* ⭐ REVIEW LIST */}

        <div className="reviews-list">

          <h2>
            Reviews
          </h2>


          {
            reviews.length === 0

              ? (

                <p>
                  No reviews yet
                </p>

              )

              : (

                reviews.map(
                  (review) => (

                    <div

                      key={
                        review._id
                      }

                      className="review-card"

                    >

                      <h4>

                        {review.userEmail}

                      </h4>


                      <p>

                        {
                          "⭐".repeat(
                            review.rating
                          )
                        }

                      </p>


                      <p>

                        {review.comment}

                      </p>


                    </div>

                  )
                )

              )
          }

        </div>


        {/* 📅 BOOKING PANEL */}

        {
          showBooking && (

            <BookingModal

              product={
                product
              }

              onClose={() =>
                setShowBooking(
                  false
                )
              }

              onConfirm={
                rentProduct
              }

            />

          )
        }


        {/* 💬 CHAT PANEL */}

        {
          showChat && (

            <ChatBox

              product={
                product
              }

              ownerEmail={
                product.ownerEmail
              }

              onClose={() =>
                setShowChat(
                  false
                )
              }

            />

          )
        }


      </div>

    </div>

  );

}


export default ProductDetails;