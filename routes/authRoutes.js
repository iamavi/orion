const express = require("express");
const { login, forgotPassword, resetPassword, loginLimiter, logout } = require("../controllers/authController");
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });
const router = express.Router();
router.post("/login", loginLimiter, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", csrfProtection, resetPassword);
router.post("/logout", logout);

module.exports = router;
