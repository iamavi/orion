import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Place your logo in `src/assets/logo.png`
import { toast } from "react-toastify"; // Import toast
import apiClient from "../utils/apiClient"; // ✅ Ensure CSRF Token is fetched

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Define setLoading
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // ✅ Show loading indicator

    try {

        // ✅ Send login request with credentials
        const response = await apiClient.post("/auth/login", { email, password });

        const { accessToken, refreshToken, role, user, mustChangePassword } = response.data;
        // ✅ Store tokens securely in sessionStorage
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", role);
        localStorage.setItem("mustChangePassword", mustChangePassword); // ✅ Store flag

        toast.success("Login Successful!"); // ✅ Show success toast

        // ✅ Redirect user based on `mustChangePassword`
        if (mustChangePassword === 1) {
            navigate("/change-password"); // 🔒 Force password change for first-time login
        } else if (role === "admin") {
            navigate("/admin-dashboard"); // ✅ Redirects Admins
        } else {
            navigate("/dashboard"); // ✅ Redirects Regular Users
        }
    } catch (err) {
        console.error("Login Error:", err.response?.data || err); // ✅ Debugging
        const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage); // ❌ Show error toast
    } finally {
        setLoading(false); // ✅ Hide loading indicator
    }
};
  

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "400px" }}>
        <div className="text-center">
          <img src={logo} alt="Company Logo" width="150" className="mb-3" />
          <h3 className="mb-3">Welcome Back</h3>
        </div>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3 d-flex justify-content-between">
            <div>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="rememberMe" className="ms-2">Remember Me</label>
            </div>
            <a href="/forgot-password" className="text-decoration-none">Forgot Password?</a>
          </div>


          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
