import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect Routes Middleware
export const protect = async (req, res, next) => {
  let token;

  try {
    // Check Authorization Header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get User (Exclude Password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Access Denied. No Token Provided.",
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};

// Admin Only Middleware
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Admin Access Only",
    });
  }

  next();
};
