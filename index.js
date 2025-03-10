import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

const app = express();

// CORS Configuration (Allow All or Restrict to Specific Domains)
app.use(cors({
  origin: ["https://blogapp-server-1-pqhu.onrender.com", "http://localhost:3000", "http://localhost:4000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Exit process if MongoDB fails to connect
  });

// Routes
app.use("/users", authRoutes);     // Authentication (Register/Login)
app.use("/posts", postRoutes);     // Posts Route
app.use("/comments", commentRoutes); // Comments Route

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
