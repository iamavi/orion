const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const zxcvbn = require("zxcvbn");
const crypto = require("crypto");
const { findUserByEmail, updatePassword, setPasswordResetToken, getUserByResetToken, clearResetToken,getEmployeeByEmail, getAuthDetailsByEmployeeId, storeRefreshToken,deleteRefreshToken } = require("../models/UserModel");
const { jwtSecret, refreshTokenSecret } = require("../config/env");
const sendEmail = require("../utils/emailService");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Max 5 login attempts per 15 minutes
    message: "Too many login attempts. Please try again later.",
});

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1️⃣ Fetch employee details
        const employee = await getEmployeeByEmail(email);
        if (!employee) {
            return res.status(400).json({ message: "User not found" });
        }

        // 2️⃣ Get authentication details from `employee_auth`
        const authDetails = await getAuthDetailsByEmployeeId(employee.id);
        if (!authDetails) {
            return res.status(400).json({ message: "Authentication details not found" });
        }

        // 3️⃣ Compare provided password with stored hashed password
        const validPassword = await bcrypt.compare(password, authDetails.password_hash);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // 4️⃣ Generate Tokens
        const accessToken = jwt.sign(
            { id: employee.id, role: employee.role },
            jwtSecret,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: employee.id },
            refreshTokenSecret,
            { expiresIn: "7d" }
        );

        // 5️⃣ Store Refresh Token in the Database
        await storeRefreshToken(employee.id, refreshToken);

        // 6️⃣ Return tokens & user details
        res.json({
            accessToken,
            refreshToken,
            role: employee.role,
            user: {
                id: employee.id,
                name: `${employee.first_name} ${employee.last_name}`,
                role: employee.role
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: "User not found" });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const resetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    await setPasswordResetToken(email, resetToken);

    const resetLink = `http://localhost:3000/reset-password/${rawToken}`;
    await sendEmail(email, "Password Reset", `Click the following link to reset your password: ${resetLink}`);

    res.json({ message: "Password reset email sent" });
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (zxcvbn(newPassword).score < 3) return res.status(400).json({ message: "Weak password" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await getUserByResetToken(hashedToken);
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    await updatePassword(user.email, newPassword);
    await clearResetToken(user.email);

    res.json({ message: "Password has been reset successfully" });
};

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
console.log('refreshToken',refreshToken);
        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required" });
        }
        // 🔹 Remove the refresh token from the database
        const deleted = await deleteRefreshToken(refreshToken);

        if (!deleted) {
            return res.status(400).json({ message: "Invalid token or already logged out" });
        }
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { login, logout, forgotPassword, resetPassword, loginLimiter};
