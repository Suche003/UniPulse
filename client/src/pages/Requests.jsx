import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./Requests.css";

const Requests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const navigate = useNavigate();

  const club = JSON.parse(localStorage.getItem("unipulse_user")) || {};
  const clubId = club.clubid || club._id;

  useEffect(() => {
    fetchClubBookings();
  }, []);

  const fetchClubBookings = async () => {
    try {
      if (!clubId) {
        setError("Club ID not found. Please log in.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const res = await axios.get(
        `http://localhost:5000/api/bookings/club?clubid=${clubId}`
      );

      setBookings(res.data);
    } catch (err) {
      setError("Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setStatusFilter("All");
    fetchClubBookings();
  };

  const updateStatus = async (bookingId, status) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        { status }
      );

      toast.success(res.data.message);
      fetchClubBookings();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.category || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All"
        ? true
        : b.status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="requests-page">
      <div className="admin-events-container">

        {/* HEADER */}
        <section className="admin-events-header glass-card-events">
          <h1>Stall Booking Requests</h1>

          <button
            className="admin-events-back-btn"
            onClick={() => navigate("/club/dashboard")}
          >
            &#8617; Go Back
          </button>
        </section>

        {/* TOOLBAR */}
        <section className="admin-events-toolbar glass-card-events">

          <div className="toolbar-left">

            <div className="google-search">
              <svg className="google-search-icon" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5
                  6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59
                  4.23-1.57l.27.28v.79L20 21.5 21.5 20l-6-6z"
                />
              </svg>

              <input
                type="text"
                placeholder="Search Booking ID, Event, Stall..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className="admin-events-refresh-btn"
              onClick={handleRefresh}
            >
              Refresh
            </button>

          </div>

          <div className="status-dropdown-wrapper">
            <select
              className="status-dropdown"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
              <option>Booked</option>
            </select>
          </div>

          <button
            className="stalls-create-btn big-report-btn"
            onClick={() => navigate("/report")}
          >
            Report
          </button>

        </section>

        {/* TABLE */}
        <section className="glass-card-events table-box">

          {loading ? (
            <div className="admin-events-message">Loading...</div>
          ) : error ? (
            <div className="admin-events-message">{error}</div>
          ) : filteredBookings.length === 0 ? (
            <div className="admin-events-message">No bookings found</div>
          ) : (
            <div className="table-wrapper">
              <table className="prof-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Event</th>
                    <th>Stall</th>
                    <th>Vendor</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b._id}>
                      <td>{b.bookingId}</td>
                      <td>{b.title}</td>
                      <td>{b.stallId} ({b.category})</td>
                      <td>{b.email}</td>
                      <td>{b.phone}</td>
                      <td>{b.type}</td>

                      <td>
                        <span className={`status-badge ${b.status}`}>
                          {b.status}
                        </span>
                      </td>

                
                      <td className="action-buttons">

                        {b.status === "pending" && (
                          <>
                            <button
                              className="approve"
                              onClick={() => updateStatus(b.bookingId, "approved")}
                            >
                              Approve
                            </button>

                            <button
                              className="reject"
                              onClick={() => updateStatus(b.bookingId, "rejected")}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {b.status === "approved" && (
                          <button
                            className="reject"
                            onClick={() => updateStatus(b.bookingId, "rejected")}
                          >
                            Reject
                          </button>
                        )}

                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </section>

      </div>
    </div>
  );
};

export default Requests;