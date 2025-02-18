import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (user) {
    // Redirect Admins to Admin Dashboard, Users to Dashboard
    return <Navigate to={user.role === "admin" ? "/admin-dashboard" : "/dashboard"} replace />;
  }
  
  return <Outlet />; // ✅ Render child routes if no user is logged in
};

export default PublicRoute;
