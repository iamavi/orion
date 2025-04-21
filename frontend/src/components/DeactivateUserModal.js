import React, { useState } from "react";
import apiClient from "../utils/apiClient";
import { toast } from "react-toastify";

const DeactivateUserModal = ({ show, onClose, onDeactivate }) => {
  const [formData, setFormData] = useState({
    lastWorkingDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onDeactivate(formData.lastWorkingDate, formData.reason);
      toast.success("User deactivated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to deactivate user.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content p-4 rounded shadow-lg bg-white" style={{ maxWidth: "500px", margin: "auto" }}>
        <h3 className="text-center mb-4">Deactivate User</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Last Working Date <span className="text-danger">*</span></label>
            <input
              type="date"
              name="lastWorkingDate"
              className="form-control"
              value={formData.lastWorkingDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Reason for Deactivation <span className="text-danger">*</span></label>
            <textarea
              name="reason"
              className="form-control"
              rows="3"
              placeholder="Enter reason for deactivation"
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </div>

          <div className="d-flex justify-content-between mt-4">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-danger" disabled={loading}>
              {loading ? "Deactivating..." : "Deactivate User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeactivateUserModal; 