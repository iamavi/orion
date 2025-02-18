import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import TableComponent from "../components/TableComponent";
import apiClient from "../utils/apiClient";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import CreateUserModal from "../components/CreateUserModal";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchUsers();
  }, []);


  const fetchUsers = async () => {
    try {
      const response = await apiClient.get("/users");
      setUsers(response.data);
    } catch (error) {
      if (!toast.isActive("fetchError")) { // ✅ Prevents duplicate toasts
        toast.error("Failed to fetch users.", { toastId: "fetchError" });
      }
    }
  };
  

  const handleExportToExcel = () => {
    if (users.length === 0) return;

    const filteredUsers = users
      .filter((user) => (activeTab === "active" ? user.status === "active" : user.status === "inactive"))
      .map(({ first_name, last_name, email, created_at, role, department, status }) => ({
        Name: `${first_name} ${last_name}`,
        Email: email,
        Role: role,
        Department: department,
        "Created Date": new Date(created_at).toLocaleDateString(),
        Status: status,
      }));

    const worksheet = XLSX.utils.json_to_sheet(filteredUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "UserList.xlsx");
  };

  return (
    <Layout>
      <h2>User Management</h2>

      {/* Tabs for Active & Inactive Users */}
      <div className="mb-3">
        <button className={`btn ${activeTab === "active" ? "btn-primary" : "btn-outline-primary"} me-2`} onClick={() => setActiveTab("active")}>
          Active Users
        </button>
        <button className={`btn ${activeTab === "inactive" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setActiveTab("inactive")}>
          Inactive Users
        </button>

        {/* ✅ Show Create User button only for Admins */}
        {isAdmin && (
          <button className="btn btn-success float-end" onClick={() => setShowCreateModal(true)}>
            + Create User
          </button>
        )}
      </div>

      {/* Reusable Table Component */}
      <TableComponent
        columns={["Name", "Email", "Role", "Department", "Created Date", "Actions"]}
        data={users
          .filter((user) => (activeTab === "active" ? user.status === "active" : user.status === "inactive"))
          .map((user) => ({
            Name: `${user.first_name} ${user.last_name}`,
            Email: user.email,
            Role: user.role,
            Department: user.department,
            "Created Date": new Date(user.created_at).toLocaleDateString(),
            Actions: isAdmin ? ( // ✅ Hide actions for non-admins
              <>
                <button className="btn btn-sm btn-warning me-2">✏️ Edit</button>
                <button className="btn btn-sm btn-danger">🚫 Deactivate</button>
              </>
            ) : (
              "🔒 Restricted"
            ),
          }))}
      />

      {/* Export Button - Only visible if users exist */}
      {users.length > 0 && (
        <button className="btn btn-outline-success mt-3" onClick={handleExportToExcel}>
          📥 Export to Excel
        </button>
      )}

      {/* Create User Modal */}
      {showCreateModal && <CreateUserModal onClose={() => setShowCreateModal(false)} employees={users} fetchUsers={fetchUsers} />}
    </Layout>
  );
};

export default UserManagement;
