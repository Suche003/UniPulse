import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminPeoplePages.css";

export default function AllVendors() {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "http://localhost:5000/api/vendors?status=approved"
      );

      setVendors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch vendors error:", err);
      console.error("Response data:", err.response?.data);
      console.error("Status:", err.response?.status);

      setError(err.response?.data?.message || "Failed to fetch vendors.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVendor = async (vendorId, companyName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${companyName}?`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/vendors/${vendorId}`);

      if (selectedVendor && selectedVendor._id === vendorId) {
        setSelectedVendor(null);
      }

      fetchVendors();
    } catch (err) {
      console.error("Delete vendor error:", err);
      alert(err.response?.data?.message || "Failed to delete vendor.");
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const filteredVendors = useMemo(() => {
    const value = searchTerm.toLowerCase();

    return vendors.filter((vendor) => {
      return (
        vendor?.companyName?.toLowerCase().includes(value) ||
        vendor?.email?.toLowerCase().includes(value) ||
        vendor?.contact?.toLowerCase().includes(value) ||
        vendor?.businessRegistrationNo?.toLowerCase().includes(value) ||
        vendor?.stallType?.toLowerCase().includes(value) ||
        vendor?.status?.toLowerCase().includes(value) ||
        vendor?.address?.toLowerCase().includes(value)
      );
    });
  }, [vendors, searchTerm]);

  return (
    <div className="admin-people-page">
      <div className="admin-people-bg"></div>

      <div className="admin-people-container">
        <div className="admin-people-header glass-card">
          <div>
            <h1>All Vendors</h1>
          </div>

          <button
            className="admin-back-btn"
            onClick={() => navigate("/superadmin/control-panel")}
          >
            <span>&#8617;</span> Go Back
          </button>
        </div>

        <div className="admin-people-stats">
          <div className="glass-card stat-card">
            <span className="stat-label">Total Vendors</span>
            <h2>{vendors.length}</h2>
          </div>

          <div className="glass-card stat-card">
            <span className="stat-label">Showing Results</span>
            <h2>{filteredVendors.length}</h2>
          </div>
        </div>

        <div className="glass-card admin-toolbar">
          <input
            type="text"
            placeholder="Search by company, email, contact, BR no, stall type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />

          <button className="admin-refresh-btn" onClick={fetchVendors}>
            Refresh
          </button>
        </div>

        {loading && (
          <div className="glass-card admin-message">Loading vendors...</div>
        )}

        {error && <div className="glass-card admin-error">{error}</div>}

        {!loading && !error && (
          <div className="glass-card admin-table-wrap">
            {filteredVendors.length === 0 ? (
              <div className="admin-message">No vendors found.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Company Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Business Reg. No</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((vendor, index) => (
                    <tr key={vendor._id || index}>
                      <td>{index + 1}</td>
                      <td>{vendor.companyName || "N/A"}</td>
                      <td>{vendor.email || "N/A"}</td>
                      <td>{vendor.contact || "N/A"}</td>
                      <td>{vendor.businessRegistrationNo || "N/A"}</td>
                      <td>
                        <div className="table-action-group">
                          <button
                            className="table-action-btn"
                            onClick={() => setSelectedVendor(vendor)}
                          >
                            View
                          </button>

                          <button
                            className="table-delete-btn"
                            onClick={() =>
                              handleDeleteVendor(vendor._id, vendor.companyName)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {selectedVendor && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedVendor(null)}
        >
          <div
            className="admin-modal glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h3>Vendor Details</h3>
              </div>

              <button
                className="modal-close-btn"
                onClick={() => setSelectedVendor(null)}
              >
                ✕
              </button>
            </div>

            <div className="details-grid">
              <div className="detail-box">
                <span>Company Name</span>
                <p>{selectedVendor.companyName || "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Email</span>
                <p>{selectedVendor.email || "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Contact Number</span>
                <p>{selectedVendor.contact || "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Business Registration No</span>
                <p>{selectedVendor.businessRegistrationNo || "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Stall Type</span>
                <p>{selectedVendor.stallType || "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Status</span>
                <p>{selectedVendor.status || "N/A"}</p>
              </div>

              <div className="detail-box detail-box--full">
                <span>Address</span>
                <p>{selectedVendor.address || "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Created At</span>
                <p>
                  {selectedVendor.createdAt
                    ? new Date(selectedVendor.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>

              <div className="detail-box">
                <span>Updated At</span>
                <p>
                  {selectedVendor.updatedAt
                    ? new Date(selectedVendor.updatedAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                className="table-delete-btn"
                onClick={() =>
                  handleDeleteVendor(
                    selectedVendor._id,
                    selectedVendor.companyName
                  )
                }
              >
                Delete Vendor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}