import React, {
  useState
} from "react";

import "../App.css";

function Support() {

  // ❓ FAQ OPEN STATE
  const [openIndex,
    setOpenIndex] =
    useState(null);

  // 📋 FAQ DATA
  const faqs = [

    {
      question:
        "How do I rent a product?",

      answer:
        "Open the product details page, select booking dates, and send a rental request to the owner."
    },

    {
      question:
        "How do payments work?",

      answer:
        "Payments are securely processed after booking confirmation from the owner."
    },

    {
      question:
        "Can I cancel a booking request?",

      answer:
        "Yes, you can contact the product owner before the booking gets accepted."
    },

    {
      question:
        "How can I contact the product owner?",

      answer:
        "Use the built-in chat feature available on every product details page."
    },

    {
      question:
        "Why is a product unavailable?",

      answer:
        "Products become unavailable after the owner accepts a booking request."
    },

    {
      question:
        "How do I upload products?",

      answer:
        "Go to Add Product page and fill product details including image, category, and price."
    }

  ];

  // 🔥 TOGGLE FAQ
  const toggleFAQ = (index) => {

    if (openIndex === index) {

      setOpenIndex(null);

    } else {

      setOpenIndex(index);

    }

  };

  return (

    <div className="support-page">

      {/* 🔥 HEADER */}
      <div className="support-header">

        <h1>
          Help & Support
        </h1>

        <p>
          We are here to help you 🚀
        </p>

      </div>

      {/* 📧 CONTACT CARD */}
      <div className="support-card">

        <h2>
          Contact Support
        </h2>

        <p>
          Need help regarding bookings,
          payments, or products?
        </p>

        <a

  href="mailto:rentify.support@gmail.com"

  className="support-email"

>

  📧 rentify.support@gmail.com

</a>

      </div>

      {/* ❓ FAQ SECTION */}
      <div className="faq-section">

        <h2>
          Frequently Asked Questions
        </h2>

        {faqs.map((faq, index) => (

          <div
            key={index}
            className="faq-card"
          >

            {/* QUESTION */}
            <div

              className="faq-question"

              onClick={() =>
                toggleFAQ(index)
              }

            >

              <h3>
                {faq.question}
              </h3>

              <span>

                {openIndex === index
                  ? "−"
                  : "+"}

              </span>

            </div>

            {/* ANSWER */}
            {openIndex === index && (

              <div className="faq-answer">

                <p>
                  {faq.answer}
                </p>

              </div>

            )}

          </div>

        ))}

      </div>

    </div>

  );

}

export default Support;