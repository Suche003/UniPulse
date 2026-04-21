import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./TicketPurchase.css";

function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateString) {
  const date = new Date(dateString);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function TicketPurchase() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [student, setStudent] = useState(null);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [existingTicket, setExistingTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPurchaseData();
  }, [eventId]);

  async function fetchPurchaseData() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("unipulse_token");

      const res = await axios.get(
        `http://localhost:5000/api/student/tickets/purchase/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEvent(res.data.event || null);
      setStudent(res.data.student || null);
      setAlreadyExists(!!res.data.alreadyExists);
      setExistingTicket(res.data.existingTicket || null);
    } catch (err) {
      console.error("Error loading purchase page:", err);
      setError(err.response?.data?.message || "Failed to load purchase form.");
    } finally {
      setLoading(false);
    }
  }

  async function handleProceedPayment(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const token = localStorage.getItem("unipulse_token");

      const res = await axios.post(
        `http://localhost:5000/api/student/tickets/purchase/${eventId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const ticket = res.data.ticket;
      navigate(`/student/payment/${ticket._id}`);
    } catch (err) {
      console.error("Error proceeding to payment:", err);
      setError(
        err.response?.data?.message || "Failed to proceed to payment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="ticket-page">
        <Navbar />
        <main className="ticket-container">
          <section className="ticket-card">
            <h1>Loading...</h1>
          </section>
        </main>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="ticket-page">
        <Navbar />
        <main className="ticket-container">
          <section className="ticket-card">
            <h1>Purchase Unavailable</h1>
            <p className="ticket-muted">{error}</p>
            <Link to="/student/dashboard" className="ticket-btn ticket-btn--ghost">
              Back to Dashboard
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="ticket-page">
      <Navbar />

      <main className="ticket-container">
        <section className="ticket-hero">
          <p className="ticket-hero__tag">TICKET PURCHASE</p>
          <h1 className="ticket-hero__title">Purchase Event Ticket</h1>
          <p className="ticket-hero__subtitle">
            Review your event details before proceeding to the payment page.
          </p>
        </section>

        <section className="ticket-card">
          <div className="ticket-card__header">
            <h2>Ticket Information</h2>
            <p>Only one ticket is allowed per student for this event.</p>
          </div>

          {alreadyExists ? (
            <div className="ticket-existing-box">
              <h3>
                {existingTicket?.status === "paid"
                  ? "Ticket Already Purchased"
                  : "Ticket Already Created"}
              </h3>

              <p>
                {existingTicket?.status === "paid"
                  ? "You have already purchased this ticket."
                  : "You already have a ticket record for this event."}
              </p>

              <div className="ticket-existing-meta">
                <div className="ticket-row">
                  <span>Event</span>
                  <strong>{existingTicket?.eventName}</strong>
                </div>
                <div className="ticket-row">
                  <span>Student</span>
                  <strong>{existingTicket?.studentIdDisplay}</strong>
                </div>
                <div className="ticket-row">
                  <span>Status</span>
                  <strong>{existingTicket?.status}</strong>
                </div>
              </div>

              {existingTicket?.status === "paid" ? (
                <button
                  className="ticket-btn ticket-btn--primary"
                  onClick={() => navigate("/student/dashboard")}
                >
                  Back to Dashboard
                </button>
              ) : (
                <button
                  className="ticket-btn ticket-btn--primary"
                  onClick={() => navigate(`/student/payment/${existingTicket._id}`)}
                >
                  Continue to Payment
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleProceedPayment} className="ticket-form">
              <div className="ticket-grid">
                <div className="ticket-field">
                  <label>Event Name</label>
                  <input type="text" value={event?.title || ""} readOnly />
                </div>

                <div className="ticket-field">
                  <label>Event Date</label>
                  <input type="text" value={formatDate(event?.date)} readOnly />
                </div>

                <div className="ticket-field">
                  <label>Event Time</label>
                  <input type="text" value={formatTime(event?.time)} readOnly />
                </div>

                <div className="ticket-field">
                  <label>Buyer (Student ID)</label>
                  <input
                    type="text"
                    value={student?.studentIdDisplay || ""}
                    readOnly
                  />
                </div>

                <div className="ticket-field">
                  <label>Ticket Quantity</label>
                  <input type="text" value="1" readOnly />
                </div>

                <div className="ticket-field">
                  <label>Total Amount</label>
                  <input
                    type="text"
                    value={`Rs. ${event?.amount || 0}`}
                    readOnly
                  />
                </div>
              </div>

              {error && <p className="ticket-error">{error}</p>}

              <div className="ticket-actions">
                <Link
                  to={`/student/events/${eventId}`}
                  className="ticket-btn ticket-btn--ghost"
                >
                  Back
                </Link>

                <button
                  type="submit"
                  className="ticket-btn ticket-btn--primary"
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : "Proceed Payment"}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}