import { useEffect, useState } from "react";   
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiClock, FiShoppingCart } from "react-icons/fi";
import axios from "axios";
import { logout } from "../auth/auth";
import "./VendorDashboard.css";

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [stallCounts, setStallCounts] = useState({ approved: 0, rejected: 0, pending: 0 });

  // modal + form state
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("unipulse_user");
    const role = localStorage.getItem("unipulse_role");

    if (!savedUser || role !== "vendor") {
      logout();
      navigate("/login");
      return;
    }

    const vendorData = JSON.parse(savedUser);

    const fetchVendorData = async () => {
      try {
        const vendorRes = await axios.get(
          `http://localhost:5000/api/vendors/${vendorData.id}`
        );
        setVendor(vendorRes.data);

        const bookingsRes = await axios.get(
          `http://localhost:5000/api/bookings/vendor?email=${vendorData.email}`
        );

        const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];

        setStallCounts({
          approved: bookings.filter(
            b => b.status === "approved" || b.status === "booked"
          ).length,
          rejected: bookings.filter(b => b.status === "rejected").length,
          pending: bookings.filter(b => b.status === "pending").length
        });

      } catch (err) {
        console.error("Error fetching vendor or bookings:", err);
        setVendor({ ...vendorData, companyName: "Vendor" });
      }
    };

    fetchVendorData();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // OPEN EDIT MODAL
  const handleEditProfile = () => {
    setFormData({
      companyName: vendor.companyName || "",
      email: vendor.email || "",
      phone: vendor.contact || ""   
    });
    setShowEditModal(true);
  };

  // INPUT CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // UPDATE PROFILE
  const handleUpdateProfile = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/vendors/${vendor._id}`,
        {
          companyName: formData.companyName,
          email: formData.email,
          contact: formData.phone  
        }
      );

      setVendor({
        ...vendor,
        companyName: formData.companyName,
        email: formData.email,
        contact: formData.phone
      });

      setShowEditModal(false);

      alert("Profile updated successfully!");

    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update profile!");
    }
  };

  if (!vendor) return <p>Loading...</p>;

  return (
    <div className="vendor-dashboard">

      {/* NAVBAR */}
      <header className="vendor-dashboard-navbar">
        <div className="vendor-dashboard-navbar__left">
          <div className="vendor-dashboard-navbar__brand-dot"></div>
          <div>
            <h2>UniPulse</h2>
            <span>Vendor Dashboard</span>
          </div>
        </div>

        <div className="vendor-dashboard-navbar__right">

          <button
            className="vendor-nav-btn vendor-nav-btn--edit"
            onClick={handleEditProfile}
          >
            Profile
          </button>

          <button
            className="vendor-nav-btn vendor-nav-btn--logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* WELCOME */}
      <header className="dashboard-welcome-card">
        <h1>
          Welcome, <span>{vendor.companyName}</span>!
        </h1>
        <p>Manage your stalls, bookings, and events efficiently.</p>
      </header>

      {/* STATS */}
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

      {/* CARDS */}
      <section className="dashboard-cards">

        <div className="card">
          <div className="card-icon">
            <FiShoppingCart size={30} />
          </div>

          <h3>Event Stalls</h3>
          <p>View all upcoming events and available stalls to book.</p>

          <button
            className="card-view-btn"
            onClick={() => navigate("/vendor-stalls")}
          >
            View
          </button>
        </div>

        <div className="card">
          <div className="card-icon">
            <FiCheckCircle size={30} />
          </div>

          <h3>My Stalls</h3>
          <p>Check stalls approved for you.</p>

          <button
            className="card-view-btn"
            onClick={() => navigate("/approved-stalls")}
          >
            View
          </button>
        </div>

      </section>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">

            <h2>Edit Profile</h2>

            <input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Company Name"
            />

            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />

            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone"
            />

            <div className="edit-modal-buttons">
              <button onClick={handleUpdateProfile}>Save</button>
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}