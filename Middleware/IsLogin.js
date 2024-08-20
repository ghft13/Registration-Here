const jwt = require("jsonwebtoken");
const UserModel = require("../models/Usermodel");

const IsLogin = async (req, res, next) => {
  console.log("Checking login status"); // Debugging statement

  try {
    if (!req.cookies.token) {
      console.log("No token found"); // Debugging statement
      req.flash("error", "You need to login first");
      return res.status(401).json({ message: "You need to login first" });
    }

    const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
    const user = await UserModel.findOne({ email: decoded.email }).select(
      "-password"
    );

    if (!user) {
      console.log("User not found"); // Debugging statement
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // Attach user object to req for use in route handlers
    console.log("User authenticated"); // Debugging statement
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("Error checking login:", err.message); // Log error for debugging
    req.flash("error", "Something went wrong");
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { IsLogin };
