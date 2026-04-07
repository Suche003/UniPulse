import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiRequest } from "../api/api";
import "./SponsorList.css";

export default function SponsorList() {
  const navigate = useNavigate();

  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchSponsors() {
    setLoading(true);

    try {
      const data = await apiRequest("/api/sponsors");

      const safeData = Array.isArray(data) ? data : [];

      const pendingSponsors = safeData.filter(
        (sponsor) => (sponsor?.status || "").toLowerCase() === "pending"
      );

      setSponsors(pendingSponsors);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to load sponsor requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSponsors();
  }, []);

  async function updateStatus(id, newStatus) {
    try {
      const data = await apiRequest(`/api/sponsors/${id}/status`, {
        method: "PATCH",
        body: { status: newStatus },
      });

      setSponsors((prev) => prev.filter((s) => s._id !== id));

      toast.success(
        `Sponsor ${newStatus === "approved" ? "approved" : "rejected"} successfully!`
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update sponsor");
    }
  }

  const renderCards = () => (
    <div className="sponsor-requests-grid">
      {sponsors.map((s) => (
        <div key={s._id} className="sponsor-request-card">
          <div className="sponsor-request-card__row">
            <div className="sponsor-request-card__name">
              <h3>{s?.name || "Sponsor"}</h3>
            </div>

            <div className="sponsor-request-card__details">
              <div className="sponsor-detail-item">
                <span className="sponsor-detail-label">Email</span>
                <span className="sponsor-detail-value">
                  {s?.contactEmail || "-"}
                </span>
              </div>

              <div className="sponsor-detail-item">
                <span className="sponsor-detail-label">Phone</span>
                <span className="sponsor-detail-value">
                  {s?.contactPhone || "-"}
                </span>
              </div>

              <div className="sponsor-detail-item">
                <span className="sponsor-detail-label">Level</span>
                <span className="sponsor-detail-value">
                  {s?.level || "-"}
                </span>
              </div>

              <div className="sponsor-detail-item">
                <span className="sponsor-detail-label">Website</span>
                <span className="sponsor-detail-value">
                  {s?.website || "-"}
                </span>
              </div>
            </div>

            <div className="sponsor-request-card__actions">
              <button
                className="sponsor-btn sponsor-btn--approve"
                onClick={() => updateStatus(s._id, "approved")}
              >
                Approve
              </button>

              <button
                className="sponsor-btn sponsor-btn--reject"
                onClick={() => updateStatus(s._id, "rejected")}
              >
                Reject
              </button>
            </div>
          </div>

          {s?.description && (
            <div className="sponsor-request-card__description">
              <span className="sponsor-detail-label">Description</span>
              <p>{s.description}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="sponsor-requests-page">
      <div className="sponsor-requests-container">
        <div className="sponsor-requests-header">
          <h1>Sponsor Requests</h1>

          <button
            className="sponsor-back-btn"
            onClick={() => navigate("/superadmin/control-panel")}
          >
            <span>&#8617;</span> Go Back
          </button>
        </div>

        {loading ? (
          <div className="sponsor-loading-card">
            Loading sponsor requests...
          </div>
        ) : sponsors.length === 0 ? (
          <div className="sponsor-empty-card">
            No pending sponsor requests found.
          </div>
        ) : (
          renderCards()
        )}
      </div>
    </div>
  );
}