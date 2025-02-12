import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ element }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (user) {
    // Redirect Admins to Admin Dashboard, Users to Dashboard
    return <Navigate to={user.role === "admin" ? "/admin-dashboard" : "/dashboard"} replace />;
  }
  
  return element; // Allow access to login page if no user is logged in
};

export default PublicRoute;
