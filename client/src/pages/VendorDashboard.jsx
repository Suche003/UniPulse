import { useEffect, useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiClock, FiShoppingCart } from "react-icons/fi";
import axios from "axios";
import "./VendorDashboard.css";

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [stallCounts, setStallCounts] = useState({
    approved: 0,
    rejected: 0,
    pending: 0
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("unipulse_user");
    const role = localStorage.getItem("unipulse_role");

    if (!savedUser || role !== "vendor") {
      navigate("/login");
      return;
    }

    const vendorData = JSON.parse(savedUser);
    setVendor(vendorData);

    const fetchVendorBookings = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/bookings/vendor?email=${vendorData.email}`
        );

        const bookings = Array.isArray(res.data) ? res.data : [];

        const counts = {
          approved: bookings.filter(b => b.status === "approved" || b.status === "booked").length,
          rejected: bookings.filter(b => b.status === "rejected").length,
          pending: bookings.filter(b => b.status === "pending").length,
        };

        setStallCounts(counts);
      } catch (err) {
        console.error("Failed to fetch vendor bookings:", err);
      }
    };

    fetchVendorBookings();
  }, [navigate]);

  if (!vendor) return <p>Loading...</p>;

  return (
    <div className="vendor-dashboard page container">
      <header className="dashboard-header">
        <h1>Welcome, <span>{vendor.name}</span>!</h1>
        <p>Manage your stalls, bookings, and events efficiently.</p>
      </header>

      {/* Stall Status Counts */}
      <section className="dashboard-stats">
        <div className="stat-card approved">
          <FiCheckCircle size={28} />
          <div>
            <h3>{stallCounts.approved}</h3>
            <p>Approved Stalls</p>
          </div>
        </div>
        <div className="stat-card rejected">
          <FiXCircle size={28} />
          <div>
            <h3>{stallCounts.rejected}</h3>
            <p>Rejected Stalls</p>
          </div>
        </div>
        <div className="stat-card pending">
          <FiClock size={28} />
          <div>
            <h3>{stallCounts.pending}</h3>
            <p>Pending Stalls</p>
          </div>
        </div>
      </section>

      {/* Quick Actions / Cards */}
      <section className="dashboard-cards">
        <div className="card" onClick={() => navigate("/vendor-stalls")}>
          <div className="card-icon">
            <FiShoppingCart size={30} />
          </div>
          <h3>Event Stalls</h3>
          <p>View all upcoming events and available stalls to book.</p>
        </div>

        <div className="card" onClick={() => navigate("/approved-stalls")}>
          <div className="card-icon">
            <FiCheckCircle size={30} />
          </div>
          <h3>My Stalls</h3>
          <p>Check stalls approved for you.</p>
        </div>
      </section>
    </div>
  );
}