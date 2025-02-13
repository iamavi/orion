const express = require("express");
const { login, forgotPassword, resetPassword, loginLimiter, logout,changePassword } = require("../controllers/authController");
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");

router.post("/login", loginLimiter, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", csrfProtection, resetPassword);
router.post("/logout", logout);
router.post("/change-password", authenticate, changePassword); // ✅ Protected Route

module.exports = router;
