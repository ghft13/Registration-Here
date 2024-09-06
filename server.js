const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./Config/db");
const session = require("express-session");
const flash = require("connect-flash");
// Import Mongoose models
const User = require("./models/Usermodel");
const Appointment = require("./models/Appointmentmodel");
const { IsLogin } = require("./Middleware/IsLogin");
const {
  registerUser,
  loginUser,
  logoutUser,
  BookAppointment,
} = require("./Controllers/AuthController");

// Initialize the app
const app = express();

// Middleware
app.use(cookieParser());
app.use(bodyParser.json());

app.use(
  cors({
    origin: "http://localhost:3000", // Your frontend URL
    origin: "https://jay18.netlify.app/",

    credentials: true,
  })
);

app.use(
  session({
    secret: "process.env.EXPRESS_SESSION_SECRET",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Use 'true' if you're using HTTPS
  })
);

// Set up connect-flash middleware
app.use(flash());

// Routes
app.get("/", function (req, res) {
  res.send("hello");
});

app.post("/api/auth/register", registerUser);

app.post("/api/auth/login", loginUser);

app.get("/api/profile", IsLogin, async (req, res) => {
  res.status(200).json({ user: req.user.username });
});

app.post("/api/auth/book-appointment", IsLogin, BookAppointment);

app.get("/api/auth/check-auth", IsLogin, (req, res) => {
  res.status(200).json({ authenticated: true });
});
app.post("/api/auth/logout", logoutUser);

connectDB();

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
