import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./EventDetails.css";

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

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [studentStatus, setStudentStatus] = useState(null);
  const [existingTicket, setExistingTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchEventDetails();
    if (id) {
      fetchTicketState();
    }
  }, [id]);

  async function fetchEventDetails() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("unipulse_token");

      const res = await axios.get(
        `http://localhost:5000/api/student/events/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEvent(res.data.event || null);
      setStudentStatus(res.data.studentStatus || null);
    } catch (err) {
      console.error("Error loading event details:", err);
      setError(err.response?.data?.message || "Failed to load event details.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchTicketState() {
    try {
      const token = localStorage.getItem("unipulse_token");

      const res = await axios.get(
        `http://localhost:5000/api/student/tickets/purchase/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExistingTicket(res.data.existingTicket || null);
    } catch (err) {
      console.error("Error loading ticket state:", err);
    }
  }

  async function handleGoing() {
    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("unipulse_token");

      const res = await axios.post(
        `http://localhost:5000/api/student/events/${id}/go`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message || "Successfully joined the event.");
      await fetchEventDetails();
    } catch (err) {
      console.error("Error joining event:", err);
      setError(err.response?.data?.message || "Failed to join event.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemoveGoing() {
    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("unipulse_token");

      const res = await axios.delete(
        `http://localhost:5000/api/student/events/${id}/go`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message || "Removed from going list.");
      await fetchEventDetails();
    } catch (err) {
      console.error("Error removing going event:", err);
      setError(err.response?.data?.message || "Failed to remove event.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <main className="container">
          <section className="eventDetailsCard">
            <h1>Loading...</h1>
          </section>
        </main>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="page">
        <Navbar />
        <main className="container">
          <section className="eventDetailsCard">
            <h1>Event Not Found</h1>
            <p className="eventMuted">{error}</p>
            <Link to="/student/dashboard" className="btn btn--ghost">
              Back to Dashboard
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />

      <main className="container">
        <section className="eventHero">
          <div className="eventHero__content">
            <div className="eventHero__top">
              <span className="eventCategory">{event.eventid}</span>

              <span className={event.ispaid ? "paidBadge" : "freeBadge"}>
                {event.ispaid
                  ? `Paid Event • Rs. ${event.ticketPrice || 0}`
                  : "Free Event"}
              </span>
            </div>

            <h1 className="eventHero__title">{event.title}</h1>

            <p className="eventHero__club">UniPulse Event Experience</p>

            <div className="eventHero__meta">
              <span>📅 {formatDate(event.date)}</span>
              <span>⏰ {formatTime(event.date)}</span>
              <span>📍 {event.location}</span>
            </div>
          </div>
        </section>

        <section className="eventDetailsGrid">
          <div className="eventDetailsCard">
            <h2>About This Event</h2>

            <p className="eventDescription">
              {event.description || "No description available."}
            </p>

            <div className="eventActionBox">
              {!event.ispaid ? (
                <>
                  {studentStatus?.status === "going" ? (
                    <div className="eventActionButtons">
                      <button className="btn btn--primary" disabled>
                        You're Going ✅
                      </button>

                      <button
                        className="btn btn--danger"
                        onClick={handleRemoveGoing}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Removing..." : "Remove from Going"}
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn--primary"
                      onClick={handleGoing}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Joining..." : "I Am Going"}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="eventActionButtons">
                    {existingTicket?.status === "paid" ? (
                      <button className="btn btn--primary" disabled>
                        Purchased ✅
                      </button>
                    ) : existingTicket ? (
                      <button
                        className="btn btn--primary"
                        onClick={() => navigate(`/student/payment/${existingTicket._id}`)}
                      >
                        Continue Payment
                      </button>
                    ) : (
                      <button
                        className="btn btn--primary"
                        onClick={() => navigate(`/student/ticket/${id}`)}
                      >
                        Purchase Ticket
                      </button>
                    )}
                  </div>

                  <p className="eventMuted">
                    {existingTicket?.status === "paid"
                      ? "You have already purchased this ticket."
                      : existingTicket
                      ? "Your ticket record is already created. Continue payment."
                      : "Secure your place for this event by continuing to the demo ticket purchase flow."}
                  </p>
                </>
              )}

              {message && <p className="successText">{message}</p>}
              {error && event && <p className="errorText">{error}</p>}
            </div>
          </div>

          <div className="eventDetailsCard">
            <h2>Event Information</h2>

            <div className="infoList">
              <div className="infoRow">
                <span>Event ID</span>
                <strong>{event.eventid}</strong>
              </div>

              <div className="infoRow">
                <span>Date</span>
                <strong>{formatDate(event.date)}</strong>
              </div>

              <div className="infoRow">
                <span>Time</span>
                <strong>{formatTime(event.date)}</strong>
              </div>

              <div className="infoRow">
                <span>Venue</span>
                <strong>{event.location}</strong>
              </div>

              <div className="infoRow">
                <span>Entry Type</span>
                <strong>{event.ispaid ? "Paid" : "Free"}</strong>
              </div>

              {event.ispaid && (
                <div className="infoRow">
                  <span>Ticket Price</span>
                  <strong>Rs. {event.ticketPrice || 0}</strong>
                </div>
              )}
            </div>

            <div className="eventDetailsButtons">
              <Link to="/student/dashboard" className="btn btn--ghost">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}