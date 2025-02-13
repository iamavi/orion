const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv"); // Load env variables
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { port } = require("./config/env");

// Load environment variables
dotenv.config();

const app = express();

// ✅ Security Middleware
app.use(helmet()); // Secure HTTP headers
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON request bodies

// ✅ Rate Limiter to prevent brute-force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later.",
});
app.use(limiter);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // ✅ Authentication handled inside `userRoutes.js`

// ✅ Health Check Route
app.get("/", (req, res) => {
    res.send("🚀 Task Management API is running...");
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// ✅ Start Server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
