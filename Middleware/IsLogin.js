const jwt = require('jsonwebtoken');

const IsLogin = (req, res, next) => {
  try {
    // Retrieve token from cookies
    const token = req.cookies.token;

    // If no token, return an unauthorized response
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Attach the user information to the request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();  // Call next() instead of sending a response here
  } catch (err) {
    // If there's an error verifying the token, respond with 401
    return res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = IsLogin;
