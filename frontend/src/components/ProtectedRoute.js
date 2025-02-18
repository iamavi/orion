import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token"); // Check if user is logged in

  if (!token) {
    return <Navigate to="/" replace />; // Redirect to login if no token is found
  }

  return <Outlet />; // ✅ Render protected content
};

export default ProtectedRoute;
