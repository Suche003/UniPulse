import { useEffect, useState } from "react";

export default function Vendor() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchVendors() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/vendors/requests");
      const data = await res.json();
      setVendors(data); // all vendors
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
        { method: "PATCH" }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || `Failed to ${action}`);
        return;
      }

      setVendors((prev) =>
        prev.map((v) =>
          v._id === id
            ? { ...v, status: action === "approve" ? "approved" : "rejected" }
            : v
        )
      );

      alert(`Vendor ${action === "approve" ? "approved" : "rejected"} successfully!`);
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  }

  const renderCards = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "16px",
      }}
    >
      {vendors.map((v) => {
        let borderColor = "var(--accent)";
        if (v.status === "approved") borderColor = "#3ac57c";
        if (v.status === "rejected") borderColor = "#ff4c5b";

        return (
          <div key={v._id} className="authCard" style={{ border: `2px solid ${borderColor}` }}>
            <h3 style={{ marginBottom: "6px" }}>{v.name}</h3>
            <p><strong>NIC:</strong> {v.nic}</p>
            <p><strong>Contact:</strong> {v.contact}</p>
            <p><strong>Email:</strong> {v.email}</p>
            <p><strong>Stall Type:</strong> {v.stallType}</p>
            <p><strong>Status:</strong> {v.status.charAt(0).toUpperCase() + v.status.slice(1)}</p>

            {v.status === "pending" && (
              <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                <button className="btn btn--primary" style={{ flex: 1 }} onClick={() => updateStatus(v._id, "approve")}>Approve</button>
                <button
                  className="btn btn--ghost"
                  style={{ flex: 1, color: "#ff2b6a", borderColor: "var(--accent2)" }}
                  onClick={() => updateStatus(v._id, "reject")}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="container">
      <h1 className="authTitle" style={{ marginBottom: "20px" }}>Vendor Requests</h1>
      {loading ? <p className="smallHint">Loading...</p> : renderCards()}
    </div>
  );
}