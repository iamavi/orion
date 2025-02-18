const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const zxcvbn = require("zxcvbn");
const crypto = require("crypto");
const { findUserByEmail, updatePassword, setPasswordResetToken, getUserByResetToken, clearResetToken,getEmployeeByEmail, getAuthDetailsByEmployeeId, storeRefreshToken,deleteRefreshToken } = require("../models/UserModel");
const { jwtSecret, refreshTokenSecret } = require("../config/env");
const sendEmail = require("../utils/emailService");
const {db} = require("../config/db"); // Database connection
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Max 5 login attempts per 15 minutes
    message: "Too many login attempts. Please try again later.",
});
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Max 3 requests per window
    message: "Too many password reset requests. Please try again later."
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
        // ✅ Send Tokens as HTTP-Only Cookies
        res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "Strict", maxAge: 15 * 60 * 1000 });
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict", maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({
            role: employee.role,
            mustChangePassword: authDetails.must_change_password, // ✅ Return flag
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

const logout = async (req, res) => {console.log('asdjkjsdkjk')
    try {
        const refreshToken  = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required" });
        }
        // 🔹 Remove the refresh token from the database
        const deleted = await deleteRefreshToken(refreshToken);

        if (!deleted) {
            return res.status(400).json({ message: "Invalid token or already logged out" });
        }
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // 1️⃣ Find the user
        const user = await db("employees").where({ email }).first();
        if (!user) return res.status(400).json({ message: "User not found" });

        // 2️⃣ Generate secure reset token
        const rawToken = crypto.randomBytes(32).toString("hex");
        const resetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

        // 3️⃣ Store hashed token in the database
        await db("employee_auth").where({ employee_id: user.id }).update({
            reset_token: resetToken,
            reset_token_expires: expiresAt
        });

        // 4️⃣ Generate Reset Link
        const resetLink = `http://localhost:3000/reset-password/${rawToken}`;
        const emailBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
            <p>Hello <strong>${user.first_name}</strong>,</p>
            <p>We received a request to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="${resetLink}" 
                    style="display: inline-block; padding: 12px 20px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Reset Password
                </a>
            </div>
            <p style="color: #777;">This link is valid for <strong>5 minutes</strong>. If you didn’t request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd;">
            <p style="text-align: center; color: #555;">Best regards, <br><strong>Xumane Team</strong></p>
        </div>
    `;
    
    // Send the email
    await sendEmail(email, "Password Reset Request", emailBody);
    res.json({ message: "Password reset email sent successfully" });

    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const validateResetToken = async (req, res) => {
    const { token } = req.params;

    try {
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await db("employee_auth")
            .where({ reset_token: hashedToken })
            .andWhere("reset_token_expires", ">", new Date())
            .first();

        if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

        res.json({ message: "Valid token", employee_id: user.employee_id });

    } catch (error) {
        console.error("Error in validateResetToken:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    console.log('asdcurrentPassword, newPasswordasd',currentPassword, newPassword)
    const userId = req.user.id; // Extracted from JWT token

    try {
        // 1️⃣ Fetch authentication details
        const authDetails = await db("employee_auth").where({ employee_id: userId }).first();
        if (!authDetails) {
            return res.status(400).json({ error: "Authentication details not found" });
        }

        // 2️⃣ Validate current password
        const validPassword = await bcrypt.compare(currentPassword, authDetails.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: "Incorrect current password" });
        }

        // 3️⃣ Hash new password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(newPassword, salt);

        // 4️⃣ Update password in database & remove `must_change_password` flag
        await db("employee_auth")
            .where({ employee_id: userId })
            .update({ password_hash: hashedPassword, salt: salt, must_change_password: 0 });

        return res.json({ message: "Password updated successfully!" });

    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
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

const refreshAccessToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const user = await findUserById(decoded.id);
        if (!user) return res.status(401).json({ message: "Invalid token" });

        const newAccessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });

        res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: true, sameSite: "Strict", maxAge: 15 * 60 * 1000 });
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

module.exports = { login, logout, forgotPassword, resetPassword, loginLimiter,forgotPasswordLimiter,changePassword, validateResetToken,refreshAccessToken};
