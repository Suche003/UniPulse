import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VendorRequests.css";

export default function Vendor() {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchVendors() {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/vendors/requests");
      const data = await res.json();

      const safeData = Array.isArray(data) ? data : [];

      const pendingVendors = safeData.filter(
        (vendor) => (vendor?.status || "").toLowerCase() === "pending"
      );

      setVendors(pendingVendors);
    } catch (err) {
      console.error(err);
      alert("Failed to load vendor requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVendors();
  }, []);

  async function updateStatus(id, action) {
    try {
      const res = await fetch(
        `http://localhost:5000/api/vendors/${action}/${id}`,
        {
          method: "PATCH",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || `Failed to ${action}`);
        return;
      }

      setVendors((prev) => prev.filter((v) => v._id !== id));

      alert(
        `Vendor ${
          action === "approve" ? "approved" : "rejected"
        } successfully!`
      );
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  }

  const getVendorDisplayName = (vendor) => {
    return (
      vendor?.name ||
      vendor?.fullName ||
      vendor?.businessName ||
      vendor?.shopName ||
      vendor?.companyName ||
      vendor?.ownerName ||
      vendor?.vendorName ||
      "Vendor"
    );
  };

  const renderCards = () => (
    <div className="vendor-requests-grid">
      {vendors.map((v) => {
        const displayName = getVendorDisplayName(v);

        return (
          <div key={v._id} className="vendor-request-card">
            <div className="vendor-request-card__row">
              <div className="vendor-request-card__name">
                <h3>{displayName}</h3>
              </div>

              <div className="vendor-request-card__details">
                <div className="vendor-detail-item">
                  <span className="vendor-detail-label">Contact</span>
                  <span className="vendor-detail-value">
                    {v?.contact || "-"}
                  </span>
                </div>

                <div className="vendor-detail-item">
                  <span className="vendor-detail-label">Email</span>
                  <span className="vendor-detail-value">
                    {v?.email || "-"}
                  </span>
                </div>

                <div className="vendor-detail-item">
                  <span className="vendor-detail-label">Stall Type</span>
                  <span className="vendor-detail-value">
                    {v?.stallType || "-"}
                  </span>
                </div>
              </div>

              <div className="vendor-request-card__actions">
                <button
                  className="vendor-btn vendor-btn--approve"
                  onClick={() => updateStatus(v._id, "approve")}
                >
                  Approve
                </button>

                <button
                  className="vendor-btn vendor-btn--reject"
                  onClick={() => updateStatus(v._id, "reject")}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="vendor-requests-page">
      <div className="vendor-requests-container">
        <div className="vendor-requests-header">
          <h1>Vendor Requests</h1>

          <button
            className="vendor-back-btn"
            onClick={() => navigate("/superadmin/control-panel")}
          >
            <span>&#8617;</span> Go Back
          </button>
        </div>

        {loading ? (
          <div className="vendor-loading-card">
            Loading vendor requests...
          </div>
        ) : vendors.length === 0 ? (
          <div className="vendor-empty-card">
            No pending vendor requests found.
          </div>
        ) : (
          renderCards()
        )}
      </div>
    </div>
  );
}