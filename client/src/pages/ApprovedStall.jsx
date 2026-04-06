import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./ApprovedStall.css";

const ApprovedStall = () => {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [paidBookings, setPaidBookings] = useState({});

  useEffect(() => {
    if (location.state?.paidBookingId) {
      const id = location.state.paidBookingId;
      setPaidBookings(prev => ({ ...prev, [id]: true }));
    }
  }, [location.state]);

  const fetchStalls = async () => {
    try {
      const vendorEmail = JSON.parse(localStorage.getItem("unipulse_user"))?.email;
      if (!vendorEmail) throw new Error("Vendor email not found in localStorage");

      const res = await axios.get(
        `http://localhost:5000/api/bookings/approved?email=${vendorEmail}`
      );

      const data = Array.isArray(res.data) ? res.data : [];

      const stallsWithPaid = data.map(stall => ({
        ...stall,
        paid: stall.status === "booked" || paidBookings[stall.bookingId] || false
      }));

      setStalls(stallsWithPaid);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch approved stalls.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStalls();
    const handleFocus = () => fetchStalls();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [paidBookings]);

  const handlePayment = (stall) => {
    navigate("/stall-payment", { state: { stall, bookingId: stall.bookingId } });
  };

  if (loading) return <p className="approved-info-text">Loading approved stalls...</p>;
  if (error) return <p className="approved-error-text">{error}</p>;
  if (!stalls.length) return <p className="approved-info-text">No approved stalls found.</p>;

  return (
    <div className="approved-stalls-wrapper">
      <h2 className="approved-stalls-title">My Stalls</h2>
      <div className="approved-stalls-list">
        {stalls.map(stall => {
          const { bookingId, eventTitle, eventDate, category, price, paid } = stall;
          return (
            <div key={bookingId} className="approved-stall-card">
              <p className="approved-stall-bookingId"><strong>Booking ID:</strong> {bookingId}</p>
              <h3 className="approved-stall-event-title">{eventTitle}</h3>
              {eventDate && (
                <p className="approved-stall-event-date">
                  {new Date(eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              )}
              <p className="approved-stall-type"><strong>Stall Category:</strong> {category}</p>
              <p className="approved-stall-price"><strong>Price:</strong> Rs.{price}</p>
              <button
                className={`approved-payment-btn ${paid ? "approved-booked" : ""}`}
                disabled={paid}
                onClick={() => !paid && handlePayment(stall)}
              >
                {paid ? "Booked" : "Pay Now"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApprovedStall;