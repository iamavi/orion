import React, { useState } from "react";
import apiClient from "../utils/apiClient"; // ✅ Import centralized API handler
import { toast } from "react-toastify";

const CreateUserModal = ({ onClose, employees = [] }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "employee",
    phone: "",
    department: "",
    reporting_manager: "",
  });

  const roles = ["admin", "user"];
  const departments = ["HR", "Engineering", "Finance", "Marketing", "Sales"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await apiClient.post("/users/register", formData); // ✅ Uses centralized API client
      toast.success("User created successfully!");
      onClose();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Unauthorized! You do not have permission.");
      } else {
        toast.error("Failed to create user.");
      }
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content p-4 rounded shadow-lg bg-white" style={{ maxWidth: "500px", margin: "auto" }}>
        <h3 className="text-center mb-4">Create User</h3>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">First Name <span className="text-danger">*</span></label>
              <input type="text" name="first_name" className="form-control" placeholder="Enter First Name" onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Last Name <span className="text-danger">*</span></label>
              <input type="text" name="last_name" className="form-control" placeholder="Enter Last Name" onChange={handleChange} required />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Email <span className="text-danger">*</span></label>
            <input type="email" name="email" className="form-control" placeholder="Enter Email" onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input type="text" name="phone" className="form-control" placeholder="Enter Phone Number" onChange={handleChange} />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Role <span className="text-danger">*</span></label>
              <select name="role" className="form-control" onChange={handleChange} required>
                {roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Department <span className="text-danger">*</span></label>
              <select name="department" className="form-control" onChange={handleChange} required>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Reporting Manager</label>
            <select name="reporting_manager" className="form-control" onChange={handleChange}>
              <option value="">Select Reporting Manager</option>
              {(employees || []).map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="d-flex justify-content-between mt-4">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create User</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
