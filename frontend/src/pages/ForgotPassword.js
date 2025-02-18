import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient"; 


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiClient.post("/api/auth/forgot-password", { email });
      if (response.status === 200) {
        setMessage("A reset link has been sent to your email.");
      } else {
        setError("Unexpected error. Please try again later.");
      }
    } catch (err) {
      if (err.response) {
        // Server returned a response (4xx or 5xx)
        setError(err.response.data.error || "Something went wrong. Try again.");
      } else if (err.request) {
        // Request was made but no response received (Network error)
        setError("Network error. Please check your internet connection.");
      } else {
        // Other unexpected errors
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "400px" }}>
        <h3 className="text-center mb-3">Reset Your Password</h3>

        {message && <div className="alert alert-success text-center">{message}</div>}
        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleForgotPassword}>
          <div className="mb-3">
            <label className="form-label">Enter your email</label>
            <input
              type="email"
              className={`form-control ${error ? "is-invalid" : ""}`}
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* Back to Login Button */}
        <button
          className="btn btn-secondary w-100 mt-3"
          onClick={() => navigate("/")}
          disabled={loading}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
