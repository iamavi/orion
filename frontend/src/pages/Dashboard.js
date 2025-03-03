import React from "react";
import Layout from "../components/Layout"; // ✅ Ensure correct path
import EmployeeHomeScreen from "../components/EmployeeHomeScreen"; // ✅ Import the Employee Home Screen

const Dashboard = () => {
  return (
    <Layout>
      <EmployeeHomeScreen />
    </Layout>
  );
};

export default Dashboard;
