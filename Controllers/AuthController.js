const User = require("../models/Usermodel");
const Appointment = require("../models/Appointmentmodel");
const bcrypt = require("bcryptjs");
const generateToken = require("../Utils/GenerateToken");


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
    console.error(error.message);
    res.status(500).json({ message: "Server error", type: "error" });
  }
};
const loginUser = async (req, res) => {
  const { password, email } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found", type: "error" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", type: "error" });
    }

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


    return res
      .status(200)
      .json({ message: "Login successful", type: "success", token });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server error", type: "error" });
  }
};

const logoutUser = (req, res) => {
  res.cookie("token", "");
  res.status(200).json({ message: "Logged out successfully" });
};

const BookAppointment = async (req, res) => {
  const { service } = req.body; // Assuming service is an array of objects
  const email = req.user.email; // Get email from req.user (assuming it's set by the authentication middleware)

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found', type: 'error' });
    }

    // Create a new appointment
    let appointment = new Appointment({
      user: user._id,
      service: service, // Save service data directly
    });

    await appointment.save();
    res.status(201).json({ message: 'Appointment booked successfully', type: 'success' });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Internal Server Error', type: 'error' });
  }
};
module.exports = { registerUser, loginUser, logoutUser, BookAppointment };
