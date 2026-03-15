const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
  let token;

  console.log("Auth Middleware - Headers:", req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", token.substring(0, 20) + "...");

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);

      req.user = await User.findById(decoded.id).select("-password");

      console.log("User fetched:", req.user ? "Yes" : "No");

      if (!req.user) {
        console.log("User not found in database");
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      req.user.id = req.user._id.toString();

      console.log("Auth successful for:", req.user.email);
      next();
    } catch (error) {
      console.error("Auth error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  } else {
    console.log("No token in request");
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};

module.exports = protect;
