import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  console.log("🔹 Incoming Authorization Header:", req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      console.log("🔹 Extracted Token:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("🔹 Decoded JWT Payload:", decoded);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.error("❌ User not found in DB with ID:", decoded.id);
        return res.status(401).json({ message: "Unauthorized - User not found" });
      }

      next();
    } catch (error) {
      console.error("❌ JWT Verification Error:", error.message);
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
  } else {
    console.error("❌ No Token Provided in Headers");
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }
};


export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) { // ✅ Use `req.user.isAdmin` instead of `req.user.role`
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};
