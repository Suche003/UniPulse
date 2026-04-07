import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminPeoplePages.css";

export default function AllClubsAd() {
  const navigate = useNavigate();

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedClub, setSelectedClub] = useState(null);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await axios.get("http://localhost:5000/api/clubs");
      const safeData = Array.isArray(res.data) ? res.data : [];
      setClubs(safeData);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to load clubs and societies."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clubId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this club or society?"
    );
    if (!confirmed) return;

    try {
      setDeletingId(clubId);
      setError("");
      setMessage("");

      await axios.delete(`http://localhost:5000/api/clubs/${clubId}`);

      setClubs((prev) => prev.filter((club) => club._id !== clubId));
      setMessage("Club or society deleted successfully.");

      if (selectedClub?._id === clubId) {
        setSelectedClub(null);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to delete club or society."
      );
    } finally {
      setDeletingId("");
    }
  };

  const filteredClubs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clubs;

    return clubs.filter((club) => {
      const clubName = club?.clubName || "";
      const email = club?.email || "";
      const faculty = club?.faculty || "";
      const clubid = club?.clubid || "";

      return (
        clubName.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        faculty.toLowerCase().includes(term) ||
        clubid.toLowerCase().includes(term)
      );
    });
  }, [clubs, search]);

  return (
    <div className="admin-people-page">
      <div className="admin-people-bg"></div>

      <div className="admin-people-container">
        <section className="admin-people-header glass-card">
          <div>
            <h1>All Clubs & Societies</h1>
          </div>

          <button
            type="button"
            className="admin-back-btn"
            onClick={() => navigate("/superadmin/control-panel")}
          >
            &#8617; Go Back
          </button>
        </section>

        <section className="admin-people-stats">
          <div className="stat-card glass-card">
            <span className="stat-label">TOTAL CLUBS & SOCIETIES</span>
            <h2>{clubs.length}</h2>
          </div>

          <div className="stat-card glass-card">
            <span className="stat-label">SHOWING RESULTS</span>
            <h2>{filteredClubs.length}</h2>
          </div>
        </section>

        {message && <div className="admin-message glass-card">{message}</div>}
        {error && <div className="admin-error glass-card">{error}</div>}

        <section className="admin-toolbar glass-card">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by club name, email, faculty, club ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            type="button"
            className="admin-refresh-btn"
            onClick={fetchClubs}
          >
            Refresh
          </button>
        </section>

        <section className="admin-table-wrap glass-card">
          {loading ? (
            <div className="admin-message">Loading clubs and societies...</div>
          ) : filteredClubs.length === 0 ? (
            <div className="admin-message">No clubs or societies found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Club / Society Name</th>
                  <th>Email</th>
                  <th>Faculty</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredClubs.map((club, index) => (
                  <tr key={club._id || index}>
                    <td>{index + 1}</td>
                    <td>{club?.clubName || "-"}</td>
                    <td>{club?.email || "-"}</td>
                    <td>{club?.faculty || "-"}</td>
                    <td>
                      <div className="table-action-group">
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => setSelectedClub(club)}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className="table-delete-btn"
                          onClick={() => handleDelete(club._id)}
                          disabled={deletingId === club._id}
                        >
                          {deletingId === club._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {selectedClub && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedClub(null)}
        >
          <div
            className="admin-modal glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h3>{selectedClub?.clubName || "Club Details"}</h3>
                <p className="admin-modal-subtitle">
                  Complete information about the selected club or society.
                </p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedClub(null)}
              >
                ×
              </button>
            </div>

            <div className="details-grid">
              <div className="detail-box">
                <span>Club / Society Name</span>
                <p>{selectedClub?.clubName || "-"}</p>
              </div>

              <div className="detail-box">
                <span>Email</span>
                <p>{selectedClub?.email || "-"}</p>
              </div>

              <div className="detail-box">
                <span>Faculty</span>
                <p>{selectedClub?.faculty || "-"}</p>
              </div>

              <div className="detail-box detail-box--full">
                <span>Status</span>
                <p>{selectedClub?.status || "Active"}</p>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="table-action-btn"
                onClick={() => setSelectedClub(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}