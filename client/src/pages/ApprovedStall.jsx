import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./ApprovedStall.css";

const ApprovedStall = () => {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const [paidBookings, setPaidBookings] = useState({});

  useEffect(() => {
    if (location.state?.paidBookingId) {
      const id = location.state.paidBookingId;
      setPaidBookings((prev) => ({ ...prev, [id]: true }));
    }
  }, [location.state]);

  const fetchStalls = async () => {
    try {
      const vendorEmail = JSON.parse(
        localStorage.getItem("unipulse_user")
      )?.email;

      const res = await axios.get(
        `http://localhost:5000/api/bookings/approved?email=${vendorEmail}`
      );

      const data = Array.isArray(res.data) ? res.data : [];

      const updated = data.map((stall) => ({
        ...stall,
        paid:
          stall.status === "booked" ||
          paidBookings[stall.bookingId] ||
          false,
      }));

      setStalls(updated);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch stalls.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStalls();
    window.addEventListener("focus", fetchStalls);
    return () => window.removeEventListener("focus", fetchStalls);
  }, [paidBookings]);

  const handlePayment = (stall) => {
    navigate("/stall-payment", {
      state: { stall, bookingId: stall.bookingId },
    });
  };

  //  DATE FILTER
  const filteredStalls = stalls.filter((s) => {
    const stallDate = s.createdAt ? new Date(s.createdAt) : null;
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    return (
      (!from || (stallDate && stallDate >= from)) &&
      (!to || (stallDate && stallDate <= to))
    );
  });

  const bookedStalls = filteredStalls.filter((s) => s.paid);
  const approvedStalls = filteredStalls.filter((s) => !s.paid);

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="admin-events-page">
      <div className="admin-events-container">

        {/* HEADER */}
        <section className="admin-events-header glass-card-events">
          <div>
            <h1>My Stalls</h1>
          </div>

          <button
            className="admin-events-back-btn"
            onClick={() => navigate(-1)}
          >
            &#8617; Go Back
          </button>
        </section>

        {/* DATE FILTER ONLY */}
        <div className="filter-box">

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />

          <button className="clear-btn" onClick={clearFilters}>
            Clear
          </button>

        </div>

        {/* LOADING / ERROR */}
        {loading ? (
          <div className="stall-message">Loading stalls...</div>
        ) : error ? (
          <div className="stall-message">{error}</div>
        ) : stalls.length === 0 ? (
          <div className="stall-message">No stalls found.</div>
        ) : (
          <>
            {/*  APPROVED  */}
            {approvedStalls.length > 0 && (
              <>
                <h2 className="section-title">Approved Stalls</h2>

                <div className="stall-grid">
                  {approvedStalls.map((stall) => (
                    <div key={stall.bookingId} className="stall-card">
                      <div className="stall-card-body">

                        <h3>{stall.eventTitle}</h3>

                        <div className="stall-meta">
                          <p><strong>Booking ID:</strong> {stall.bookingId}</p>

                          <p>
                            <strong>Booking Date:</strong>{" "}
                            {stall.createdAt
                              ? new Date(stall.createdAt).toLocaleDateString()
                              : "N/A"}
                          </p>

                          <p><strong>Category:</strong> {stall.category}</p>
                          <p><strong>Price:</strong> Rs. {stall.price}</p>
                        </div>

                        <div className="stall-actions">
                          <button
                            className="approved-btn"
                            onClick={() => handlePayment(stall)}
                          >
                            Pay Now
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/*  BOOKED  */}
            {bookedStalls.length > 0 && (
              <>
                <h2 className="section-title">Booked Stalls</h2>

                <div className="stall-grid">
                  {bookedStalls.map((stall) => (
                    <div key={stall.bookingId} className="stall-card">
                      <div className="stall-card-body">

                        <h3>{stall.eventTitle}</h3>

                        <div className="stall-meta">
                          <p><strong>Booking ID:</strong> {stall.bookingId}</p>

                          <p>
                            <strong>Payment Date:</strong>{" "}
                            {stall.createdAt
                              ? new Date(stall.createdAt).toLocaleDateString()
                              : "Not Available"}
                          </p>

                          <p><strong>Category:</strong> {stall.category}</p>
                          <p><strong>Price:</strong> Rs. {stall.price}</p>
                        </div>

                        <div className="stall-actions">
                          <button className="approved-btn booked" disabled>
                            Booked
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default ApprovedStall;