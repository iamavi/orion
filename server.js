const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { port } = require("./config/env");
const authenticate = require("./middlewares/authMiddleware");
const authorizeRoles = require("./middlewares/authorizeRoles");

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests, please try again later.",
});
app.use(limiter);

// Routes
app.use("/api/auth", authRoutes);

// Use the user routes
app.use("/api/users", authenticate, authorizeRoles(["admin"]), userRoutes);

app.listen(port, () => console.log(`Server running on port ${port}`));

