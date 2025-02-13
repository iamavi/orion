import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem("token"); // Check if user is logged in

  return token ? element : <Navigate to="/" replace />;
};

export default ProtectedRoute;
