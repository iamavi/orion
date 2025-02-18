import React from "react";
import { Link } from "react-router-dom";
import apiClient from "../utils/apiClient"; 

import logo from "../assets/logo.png"; // App Logo

const Layout = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user")) || { name: "User", role: "user" };

  const handleLogout = async () => {
    try {
      await apiClient.post("auth/logout");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("mustChangePassword");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="bg-dark text-white vh-100 p-3" style={{ width: "250px" }}>
        <div className="text-center mb-4">
          <img src={logo} alt="App Logo" width="120" />
        </div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className="nav-link text-white" to="/dashboard">🏠 Home</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/dashboard">📊 Dashboard</Link>
          </li>
          {user.role === "admin" && (
            <>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/settings">⚙️ Settings</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/users">👥 Users</Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1">
        <nav className="navbar navbar-light bg-light px-4 shadow-sm">
          <span className="navbar-brand">{user.name}</span>
          <div>
            <Link to="/change-password" className="btn btn-sm btn-outline-primary me-2">
              Reset Password
            </Link>
            <button className="btn btn-sm btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>

        {/* Page Content */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
