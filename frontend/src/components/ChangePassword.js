import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../utils/apiClient"; // ✅ Use apiClient for API calls

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // ✅ Password validation function
    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSymbol = /[@$!%*?&]/.test(password);

        if (password.length < minLength) return "Password must be at least 8 characters.";
        if (!hasUpperCase) return "Password must contain at least one uppercase letter.";
        if (!hasLowerCase) return "Password must contain at least one lowercase letter.";
        if (!hasNumber) return "Password must contain at least one number.";
        if (!hasSymbol) return "Password must contain at least one special character (@, $, !, %, *, ?, &).";
        return "";
    };

    // ✅ Handle password update
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        try {
            setLoading(true);
            await apiClient.post("/auth/change-password", { currentPassword, newPassword });

            toast.success("Password changed successfully! 🎉");
            sessionStorage.setItem("mustChangePassword", false); // ✅ Reset flag
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update password. Please try again.");
            toast.error("Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow p-4">
                <h2 className="text-center mb-4">Change Password</h2>

                {error && <p className="text-danger text-center">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label>Current Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label>New Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label>Confirm New Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-check mb-3">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        <label className="form-check-label">Show Password</label>
                    </div>

                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? "Updating Password..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
