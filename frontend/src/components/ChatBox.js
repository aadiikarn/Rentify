import React, {
  useEffect,
  useState
} from "react";

import axios from "axios";

import {
  io
} from "socket.io-client";

import "../App.css";

function ChatBox({

  product,
  ownerEmail,
  onClose

}) {

  // 👤 USER
  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  // 💬 STATES
  const [messages,
    setMessages] =
    useState([]);

  const [text,
    setText] =
    useState("");

  // 🔔 SOCKET STATE
  const [socket,
    setSocket] =
    useState(null);

  // ✅ CONNECT SOCKET
  useEffect(() => {

    const newSocket =
      io("http://localhost:5000");

    setSocket(newSocket);

    newSocket.on(
      "connect",
      () => {

        console.log(
          "Socket Connected ✅"
        );

      }
    );

    return () => {

      newSocket.disconnect();

    };

  }, []);

  // 🔄 FETCH + REALTIME
  useEffect(() => {

    // ✅ SAFETY
    if (
      !product?._id ||
      !user?.email ||
      !ownerEmail
    ) {

      return;

    }

    fetchMessages();

    // 🔔 REALTIME
    if (socket) {

      socket.on(

        "newMessage",

        () => {

          fetchMessages();

        }

      );

    }

    // 🧹 CLEANUP
    return () => {

      if (socket) {

        socket.off(
          "newMessage"
        );

      }

    };

  }, [product, socket]);

  // 📥 FETCH CHAT
  const fetchMessages = () => {

    axios.get(

      `http://localhost:5000/api/messages/${product._id}/${user.email}/${ownerEmail}`

    )

    .then((res) => {

      setMessages(
        res.data
      );

    })

    .catch((err) => {

      console.log(
        "FETCH ERROR:",
        err.response?.data ||
        err.message
      );

    });

  };

  // 📤 SEND MESSAGE
  const sendMessage = () => {

    // 🔒 LOGIN CHECK
    if (!user) {

      alert(
        "Please login first ❌"
      );

      return;

    }

    // ❌ EMPTY MESSAGE
    if (!text.trim()) {

      alert(
        "Type message first ❌"
      );

      return;

    }

    // ❌ PRODUCT CHECK
    if (!product?._id) {

      alert(
        "Product missing ❌"
      );

      return;

    }

    axios.post(

      "http://localhost:5000/api/messages/send",

      {

        sender:
          user.email,

        receiver:
          ownerEmail,

        productId:
          product._id,

        text: text

      }

    )

    .then((res) => {

      console.log(
        "MESSAGE SENT ✅"
      );

      // ✅ UPDATE CHAT
      setMessages((prev) => [

        ...prev,
        res.data

      ]);

      // ✅ CLEAR INPUT
      setText("");

    })

    .catch((err) => {

      console.log(
        "SEND ERROR:",
        err.response?.data ||
        err.message
      );

      alert(
        "Message failed ❌"
      );

    });

  };

  return (

    <div className="chat-box">

      {/* 🔥 HEADER */}
      <div className="chat-header">

        <h3>
          Chat
        </h3>

        <button
          onClick={onClose}
          className="btn-reject"
        >

          X

        </button>

      </div>

      {/* 💬 MESSAGES */}
      <div className="chat-messages">

        {messages.length === 0 ? (

          <p>
            No messages yet
          </p>

        ) : (

          messages.map((msg) => (

            <div

              key={msg._id}

              className={

                msg.sender ===
                user.email

                ? "my-message"

                : "other-message"

              }

            >

              <p>
                {msg.text}
              </p>

            </div>

          ))

        )}

      </div>

      {/* ✍ INPUT */}
      <div className="chat-input">

        <input

          type="text"

          placeholder="Type message..."

          value={text}

          onChange={(e) =>
            setText(e.target.value)
          }

        />

        <button
          className="btn-rent"
          onClick={sendMessage}
        >

          Send

        </button>

      </div>

    </div>

  );

}

export default ChatBox;