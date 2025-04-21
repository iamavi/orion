import React, { useState, useEffect } from "react";
import apiClient from "../utils/apiClient";
import { toast } from "react-toastify";

const EditUserModal = ({ show, onClose, user, employees, fetchUsers }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    reporting_manager: "",
  });
  const [loading, setLoading] = useState(false);

  const roles = ["user", "admin"];
  const departments = ["HR", "Engineering", "Finance", "Marketing", "Sales"];

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "user",
        department: user.department || "",
        reporting_manager: user.reporting_manager || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.put(`/users/${user.id}`, formData);
      toast.success("User updated successfully!");
      fetchUsers();
      onClose();
    } catch (error) {
      toast.error("Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content p-4 rounded shadow-lg bg-white" style={{ maxWidth: "500px", margin: "auto" }}>
        <h3 className="text-center mb-4">Edit User</h3>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">First Name <span className="text-danger">*</span></label>
              <input
                type="text"
                name="first_name"
                className="form-control"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Last Name <span className="text-danger">*</span></label>
              <input
                type="text"
                name="last_name"
                className="form-control"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              disabled
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              type="text"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Role <span className="text-danger">*</span></label>
              <select
                name="role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
                required
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Department <span className="text-danger">*</span></label>
              <select
                name="department"
                className="form-control"
                value={formData.department}
                onChange={handleChange}
                required
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Reporting Manager</label>
            <select
              name="reporting_manager"
              className="form-control"
              value={formData.reporting_manager}
              onChange={handleChange}
            >
              <option value="">Select Reporting Manager</option>
              {employees
                .filter((emp) => emp.id !== user.id) // Exclude current user from manager list
                .map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
            </select>
          </div>

          <div className="d-flex justify-content-between mt-4">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Updating..." : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal; 