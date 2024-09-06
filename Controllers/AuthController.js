const User = require("../models/Usermodel");
const Appointment = require("../models/Appointmentmodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists", type: "error" });
    }

    user = new User({ username, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    let token = jwt.sign(
      { id: user._id, username: user.username }, // Use user._id
      process.env.JWT_KEY,
      { expiresIn: "1h" } // Optional: set token expiry
    );

    // Send token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });

    res.status(201).json({
      message: "User registered successfully",
      type: "success",
      token,
    });
  } catch (error) {
    console.error("Error registering user:", error); // More descriptive logging
    res.status(500).json({ message: "Server error", type: "error" });
  }
  
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Corrected variable name
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "No user found" });
    }

    // Rest of the code remains the same
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    let token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Ensure this matches your environment
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const logoutUser = (req, res) => {
  // Clear the 'token' cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: true, // Use true in production with HTTPS, false for local development
    sameSite: "None", // Adjust depending on your setup
  });

  return res
    .status(200)
    .json({ message: "Logged out successfully", type: "success" });
};

const BookAppointment = async (req, res) => {
  const { service } = req.body; // Assuming service is an array of objects
  const email = req.user.email; // Get email from req.user (assuming it's set by the authentication middleware)

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found", type: "error" });
    }

    // Create a new appointment
    let appointment = new Appointment({
      user: user._id,
      service: service, // Save service data directly
    });

    await appointment.save();
    res
      .status(201)
      .json({ message: "Appointment booked successfully", type: "success" });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ message: "Internal Server Error", type: "error" });
  }
};
module.exports = { registerUser, loginUser, logoutUser, BookAppointment };
