const express = require("express");
const { login, forgotPassword, resetPassword, loginLimiter,forgotPasswordLimiter,logout,changePassword,validateResetToken} = require("../controllers/authController");
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");

router.post("/login", loginLimiter, login);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", csrfProtection, resetPassword);
router.get("/reset-password/:token", validateResetToken);
router.post("/logout", logout);
router.post("/change-password", authenticate, changePassword); // ✅ Protected Route

module.exports = router;
