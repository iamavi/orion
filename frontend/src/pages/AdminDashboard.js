import React from "react";
import Layout from "../components/Layout"; // ✅ Fix the path

const AdminDashboard = () => {
  return (
    <Layout>
      <h2>Admin Dashboard</h2>
      <p>Welcome, Admin! Here you can manage users, reports, and settings.</p>
    </Layout>
  );
};

export default AdminDashboard;
