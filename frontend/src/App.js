import React from "react";
import { BrowserRouter as Router, Route, Routes,Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Settings from "./pages/Settings";
import Users from "./pages/Users.js";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute"; // Import PublicRoute
const AdminRoute = ({ element }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user && user.role === "admin" ? element : <Navigate to="/dashboard" replace />;
};

const NotFoundRedirect = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin-dashboard" : "/dashboard"} replace />;
  }
  return <Navigate to="/" replace />;
};
function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={2000} />
      <Routes>
        {/* ✅ Prevent logged-in users from accessing Login */}
        <Route path="/" element={<PublicRoute element={<Login />} />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/admin-dashboard" element={<AdminRoute element={<AdminDashboard />} />} />
        <Route path="/settings" element={<AdminRoute element={<Settings />} />} />
        <Route path="/users" element={<AdminRoute element={<Users />} />} />

        {/* Catch-All Route for 404 - Redirect to Default Page */}
        <Route path="*" element={<NotFoundRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;
