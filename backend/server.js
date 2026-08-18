require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");

const {
  Server
} = require("socket.io");

const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ ROUTES
const productRoutes = require("./routes/productRoutes");

const rentRoutes = require("./routes/rentRoutes");

const authRoutes = require("./routes/authRoutes");

// 💬 CHAT ROUTES
const messageRoutes = require("./routes/messageRoutes");

// ⭐ REVIEW ROUTES
const reviewRoutes = require("./routes/reviewRoutes");

// 💳 PAYMENT ROUTES
const paymentRoutes = require("./routes/paymentRoutes");

// ✅ API ROUTES
app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/rent",
  rentRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

// 💬 CHAT API
app.use(
  "/api/messages",
  messageRoutes
);

// ⭐ REVIEW API
app.use(
  "/api/reviews",
  reviewRoutes
);

// 💳 PAYMENT API
app.use(
  "/api/payment",
  paymentRoutes
);

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send(
    "Backend Running ✅"
  );
});

// ✅ MONGODB CONNECTION
mongoose.connect(
  process.env.MONGO_URI
)

.then(() => {

  console.log(
    "Connected to MongoDB Atlas ✅"
  );

})

.catch((err) => {

  console.log(err);

});

// ✅ HTTP SERVER
const server =
  http.createServer(app);

// ✅ SOCKET.IO
const io =
  new Server(server, {

    cors: {

      origin:
        "http://localhost:3000",

      methods: [
        "GET",
        "POST"
      ]

    }

  });

// ✅ SOCKET CONNECTION
io.on(

  "connection",

  (socket) => {

    console.log(
      "User Connected 🔥"
    );

    socket.on(

      "disconnect",

      () => {

        console.log(
          "User Disconnected ❌"
        );

      }

    );

  }

);

// ✅ GLOBAL SOCKET
app.set("io", io);

// ✅ START SERVER
server.listen(5000, () => {

  console.log(
    "Server Running on 5000 🚀"
  );

});