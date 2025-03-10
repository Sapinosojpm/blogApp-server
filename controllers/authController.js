import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config(); // Load .env file

export const register = async (req, res) => {
  try {
    console.log("🟡 Register Request Body:", req.body);

    const { username, email, password, isAdmin } = req.body;

    if (!username || !email || !password) {
      console.error("❌ Missing Fields:", { username, email, password });
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error("❌ Email Already Exists:", email);
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, isAdmin });

    await newUser.save();
    console.log("✅ User Registered:", newUser);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Register Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    console.log("🟡 Login Request Body:", req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      console.error("❌ Missing Fields:", { email, password });
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.error("❌ User Not Found:", email);
      return res.status(401).json({ message: "User not found" });
    }

    console.log("✅ User Found:", user);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error("❌ Incorrect Password for:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if JWT_SECRET is loaded
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing from .env file!");
      return res.status(500).json({ message: "Server error: Missing JWT secret" });
    }

    console.log("🔵 JWT_SECRET Loaded Successfully");

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Login Successful for:", email);
    res.json({
      token,
      id: user._id, // ✅ Moved id outside of "user"
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    });
    console.log("✅ Login API Response:", {
      token,
      id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    });
    
    
    
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
