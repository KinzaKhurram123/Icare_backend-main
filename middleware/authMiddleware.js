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

      const user = await User.findById(decoded.id).select("-password");

      console.log("User fetched:", user ? "Yes" : "No");

      if (!user) {
        console.log("User not found in database");
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      req.user = user;
      // Ensure both _id and id are available for compatibility
      req.user.id = user._id.toString();

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
