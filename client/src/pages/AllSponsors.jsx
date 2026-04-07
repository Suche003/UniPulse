import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminPeoplePages.css";

export default function AllSponsors() {
  const navigate = useNavigate();

  const [sponsors, setSponsors] = useState([]);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("unipulse_token");
  const role = localStorage.getItem("unipulse_role");

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("No auth token found. Please log in again.");
        setLoading(false);
        return;
      }

      if (role !== "superadmin") {
        setError("Only super admins can view sponsors.");
        setLoading(false);
        return;
      }

      const res = await axios.get(
        "http://localhost:5000/api/sponsors?status=approved",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSponsors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch sponsors error:", err);
      console.error("Response data:", err.response?.data);
      console.error("Status:", err.response?.status);

      setError(err.response?.data?.message || "Failed to fetch sponsors.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSponsor = async (sponsorId, sponsorName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${sponsorName}?`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/sponsors/${sponsorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (selectedSponsor && selectedSponsor._id === sponsorId) {
        setSelectedSponsor(null);
      }

      fetchSponsors();
    } catch (err) {
      console.error("Delete sponsor error:", err);
      alert(err.response?.data?.message || "Failed to delete sponsor.");
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const filteredSponsors = useMemo(() => {
    const value = searchTerm.toLowerCase();

    return sponsors.filter((sponsor) => {
      return (
        sponsor?.name?.toLowerCase().includes(value) ||
        sponsor?.contactEmail?.toLowerCase().includes(value) ||
        sponsor?.contactPhone?.toLowerCase().includes(value) ||
        sponsor?.website?.toLowerCase().includes(value) ||
        sponsor?.level?.toLowerCase().includes(value) ||
        sponsor?.status?.toLowerCase().includes(value) ||
        sponsor?.description?.toLowerCase().includes(value)
      );
    });
  }, [sponsors, searchTerm]);

  return (
    <div className="admin-people-page">
      <div className="admin-people-bg"></div>

      <div className="admin-people-container">
        <div className="admin-people-header glass-card">
          <div>
            <h1>All Sponsors List</h1>
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
            <span className="stat-label">Total Sponsors</span>
            <h2>{sponsors.length}</h2>
          </div>

          <div className="glass-card stat-card">
            <span className="stat-label">Showing Results</span>
            <h2>{filteredSponsors.length}</h2>
          </div>
        </div>

        <div className="glass-card admin-toolbar">
          <input
            type="text"
            placeholder="Search by name, email, phone, website, level, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />

          <button className="admin-refresh-btn" onClick={fetchSponsors}>
            Refresh
          </button>
        </div>

        {loading && (
          <div className="glass-card admin-message">Loading sponsors...</div>
        )}

        {error && <div className="glass-card admin-error">{error}</div>}

        {!loading && !error && (
          <div className="glass-card admin-table-wrap">
            {filteredSponsors.length === 0 ? (
              <div className="admin-message">No sponsors found.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Contact Email</th>
                    <th>Contact Phone</th>
                    <th>Level</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSponsors.map((sponsor, index) => (
                    <tr key={sponsor._id || index}>
                      <td>{index + 1}</td>
                      <td>{sponsor.name || "N/A"}</td>
                      <td>{sponsor.contactEmail || "N/A"}</td>
                      <td>{sponsor.contactPhone || "N/A"}</td>
                      <td>{sponsor.level || "N/A"}</td>
                      <td>
                        <div className="table-action-group">
                          <button
                            className="table-action-btn"
                            onClick={() => setSelectedSponsor(sponsor)}
                          >
                            View
                          </button>

                          <button
                            className="table-delete-btn"
                            onClick={() =>
                              handleDeleteSponsor(sponsor._id, sponsor.name)
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

      {selectedSponsor && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedSponsor(null)}
        >
          <div
            className="admin-modal glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h3>Sponsor Details</h3>
              </div>

              <button
                className="modal-close-btn"
                onClick={() => setSelectedSponsor(null)}
              >
                ✕
              </button>
            </div>

            <div className="details-grid">
              <div className="detail-box">
                <span>Name</span>
                <p>{selectedSponsor.name || "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Contact Email</span>
                <p>{selectedSponsor.contactEmail || "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Contact Phone</span>
                <p>{selectedSponsor.contactPhone || "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Website</span>
                <p>{selectedSponsor.website || "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Level</span>
                <p>{selectedSponsor.level || "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Status</span>
                <p>{selectedSponsor.status || "N/A"}</p>
              </div>

              <div className="detail-box detail-box--full">
                <span>Description</span>
                <p>{selectedSponsor.description || "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Total Amount</span>
                <p>{selectedSponsor.totalAmount ?? "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Amount Paid</span>
                <p>{selectedSponsor.amountPaid ?? "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Payment Status</span>
                <p>{selectedSponsor.paymentStatus || "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Created At</span>
                <p>
                  {selectedSponsor.createdAt
                    ? new Date(selectedSponsor.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>

              <div className="detail-box">
                <span>Updated At</span>
                <p>
                  {selectedSponsor.updatedAt
                    ? new Date(selectedSponsor.updatedAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                className="table-delete-btn"
                onClick={() =>
                  handleDeleteSponsor(selectedSponsor._id, selectedSponsor.name)
                }
              >
                Delete Sponsor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}