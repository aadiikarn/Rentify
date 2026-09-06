import React, {
  useEffect,
  useState
} from "react";

import axios from "axios";

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import "../App.css";

function BookingModal({
  product,
  onClose,
  onConfirm
}) {

  const [startDate, setStartDate] =
    useState(null);

  const [endDate, setEndDate] =
    useState(null);

  // 🔴 BOOKED DATES
  const [bookedDates, setBookedDates] =
    useState([]);

  // 🚀 FETCH BOOKINGS
  useEffect(() => {

    if (!product || !product._id) return;

    axios.get(
      `/api/rent/product/${product._id}`
    )

    .then((res) => {

      const disabledDates = [];

      res.data.forEach((booking) => {

        const start =
          new Date(booking.startDate);

        const end =
          new Date(booking.endDate);

        for (
          let d = new Date(start);
          d <= end;
          d.setDate(
            d.getDate() + 1
          )
        ) {

          disabledDates.push(
            new Date(d)
          );

        }

      });

      setBookedDates(
        disabledDates
      );

    })

    .catch((err) => {

      console.log(err);

    });

  }, [product]);


  // ✅ SAFE RETURN
  if (!product) return null;


  // 💰 CALCULATE TOTAL AMOUNT
  const calculateAmount = () => {

    if (!startDate || !endDate) {
      return 0;
    }

    const start =
      new Date(startDate);

    const end =
      new Date(endDate);

    // Difference in milliseconds
    const difference =
      end.getTime() -
      start.getTime();

    // Convert to days
    const days =
      Math.floor(
        difference /
        (1000 * 60 * 60 * 24)
      ) + 1;

    return (
      Number(product.price) *
      days
    );

  };


  // 🚀 CONFIRM BOOKING
  const handleBooking = () => {

    if (!startDate || !endDate) {

      alert(
        "Select booking dates ❌"
      );

      return;

    }

    const amount =
      calculateAmount();

    if (amount <= 0) {

      alert(
        "Invalid booking amount ❌"
      );

      return;

    }

    onConfirm({

      startDate,
      endDate,
      amount

    });

  };


  // 💰 CURRENT TOTAL
  const totalAmount =
    calculateAmount();


  return (

    <div className="modern-booking">

      <h2>
        📅 Book Product
      </h2>


      {/* 💰 DAILY PRICE */}

      <p>

        <strong>
          Price:
        </strong>

        {" "}

        ₹{product.price}/day

      </p>


      {/* 📅 START DATE */}

      <div className="calendar-box">

        <p>
          Start Date
        </p>

        <DatePicker

          selected={startDate}

          onChange={(date) =>
            setStartDate(date)
          }

          minDate={new Date()}

          excludeDates={
            bookedDates
          }

          inline

        />

      </div>


      {/* 📅 END DATE */}

      <div className="calendar-box">

        <p>
          End Date
        </p>

        <DatePicker

          selected={endDate}

          onChange={(date) =>
            setEndDate(date)
          }

          minDate={
            startDate ||
            new Date()
          }

          excludeDates={
            bookedDates
          }

          inline

        />

      </div>


      {/* 💰 TOTAL */}

      {totalAmount > 0 && (

        <div
          style={{
            marginTop: "15px",
            padding: "12px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.08)"
          }}
        >

          <h3>

            Total Amount:

            {" "}

            ₹{totalAmount}

          </h3>

          <p>

            Payment will be required
            before sending the booking
            request.

          </p>

        </div>

      )}


      {/* 🔘 BUTTONS */}

      <div className="booking-buttons">

        <button
          className="btn-reject"
          onClick={onClose}
        >

          Cancel

        </button>


        <button
          className="btn-rent"
          onClick={handleBooking}
        >

          Continue to Payment 💳

        </button>

      </div>

    </div>

  );

}

export default BookingModal;