import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Requests.css";

const Requests = () => {
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    fetchPayments(); 
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings");
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stall-payments");
      setPayments(res.data);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  // APPROVE
  const approveBooking = async (bookingId) => {
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/status`, { status: "approved" });
      setBookings(prev =>
        prev.map(b => (b.bookingId === bookingId ? { ...b, status: "approved" } : b))
      );
    } catch (err) {
      console.error("Error approving booking:", err);
      alert("Failed to approve booking");
    }
  };

  // REJECT
  const rejectBooking = async (bookingId) => {
    const confirmReject = window.confirm("Are you sure you want to reject this booking?");
    if (!confirmReject) return;

    try {
      await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/status`, { status: "rejected" });
      
      // Update the booking status in the state instead of removing it
      setBookings(prev =>
        prev.map(b => (b.bookingId === bookingId ? { ...b, status: "rejected" } : b))
      );
    } catch (err) {
      console.error("Error rejecting booking:", err);
      alert("Failed to reject booking");
    }
  };

  // Check if booking is paid
  const isPaid = (bookingId) => {
    return payments.some(
      p => p.stallId === bookingId && p.status === "success"
    );
  };

  if (loading) return <p>Loading booking requests...</p>;

  return (
    <div className="requests-container">
      <h1>Booking Requests</h1>

      {bookings.length === 0 ? (
        <p>No booking requests yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="prof-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Category</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Stall Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => {
                const paid = isPaid(b.bookingId); 

                return (
                  <tr key={b.bookingId}>
                    <td data-label="Event ID">{b.eventid}</td>
                    <td data-label="Category">{b.category}</td>
                    <td data-label="Email">{b.email}</td>
                    <td data-label="Phone">{b.phone}</td>
                    <td data-label="Stall Type">{b.type}</td>
                    <td data-label="Status">
                      {paid ? (
                        <span className="approved">Booked</span> 
                      ) : b.status === "pending" ? (
                        <>
                          <button className="approve" onClick={() => approveBooking(b.bookingId)}>Approve</button>
                          <button className="reject" onClick={() => rejectBooking(b.bookingId)}>Reject</button>
                        </>
                      ) : (
                        <span className={
                          b.status === "approved" || b.status === "booked" 
                            ? "approved" 
                            : "rejected"
                        }>
                          {b.status === "booked" ? "Booked" : b.status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Requests;