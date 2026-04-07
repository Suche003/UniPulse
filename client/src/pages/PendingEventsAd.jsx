import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PendingEvents.css";

export default function AdminPendingEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchPendingEvents = async () => {
    try {
      setError("");
      const res = await axios.get("http://localhost:5000/api/events/pending");

      const safeData = Array.isArray(res.data) ? res.data : [];

      const pendingOnly = safeData.filter(
        (event) => (event?.status || "pending").toLowerCase() === "pending"
      );

      setEvents(pendingOnly);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const handleApprove = async (id) => {
    try {
      setError("");
      setMessage("");
      await axios.put(`http://localhost:5000/api/events/approve/${id}`);

      setMessage("Event approved successfully.");
      setEvents((prev) => prev.filter((event) => event._id !== id));
      setSelectedEvent(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      setError("");
      setMessage("");
      await axios.put(`http://localhost:5000/api/events/reject/${id}`);

      setMessage("Event rejected successfully.");
      setEvents((prev) => prev.filter((event) => event._id !== id));
      setSelectedEvent(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="pending-events-page">
      <div className="pending-events-container">
        <div className="pending-events-header">
          <h1>Pending Event Requests</h1>

          <button
            className="pending-events-back-btn"
            onClick={() => navigate("/superadmin/control-panel")}
          >
            <span>&#8617;</span> Go Back
          </button>
        </div>

        {error && <div className="pending-events-alert pending-events-alert--error">{error}</div>}
        {message && (
          <div className="pending-events-alert pending-events-alert--success">
            {message}
          </div>
        )}

        {events.length === 0 ? (
          <div className="pending-events-empty-card">No pending events found.</div>
        ) : (
          <div className="pending-events-grid">
            {events.map((event) => (
              <div key={event._id} className="pending-event-card">
                <div className="pending-event-card__row">
                  <div className="pending-event-card__name">
                    <h3>{event.title || "Untitled Event"}</h3>
                  </div>

                  <div className="pending-event-card__details">
                    <div className="pending-event-detail-item">
                      <span className="pending-event-detail-label">Date</span>
                      <span className="pending-event-detail-value">
                        {event.date
                          ? new Date(event.date).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>

                    <div className="pending-event-detail-item">
                      <span className="pending-event-detail-label">Location</span>
                      <span className="pending-event-detail-value">
                        {event.location || "-"}
                      </span>
                    </div>

                    <div className="pending-event-detail-item">
                      <span className="pending-event-detail-label">Paid</span>
                      <span className="pending-event-detail-value">
                        {event.ispaid ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  <div className="pending-event-card__actions">
                    <button
                      className="pending-event-btn pending-event-btn--view"
                      onClick={() => setSelectedEvent(event)}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedEvent && (
          <div className="pending-events-modal-overlay">
            <div className="pending-events-modal">
              <div className="pending-events-modal__header">
                <h3>{selectedEvent.title}</h3>
                <button
                  className="pending-events-modal__close"
                  onClick={() => setSelectedEvent(null)}
                >
                  ✕
                </button>
              </div>

              <div className="pending-events-modal__body">
                <div className="pending-events-modal__info-grid">
                  <div className="pending-events-modal__info-card pending-events-modal__info-card--full">
                    <span className="pending-events-modal__label">Description</span>
                    <p>{selectedEvent.description || "-"}</p>
                  </div>

                  <div className="pending-events-modal__info-card">
                    <span className="pending-events-modal__label">Date</span>
                    <p>
                      {selectedEvent.date
                        ? new Date(selectedEvent.date).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>

                  <div className="pending-events-modal__info-card">
                    <span className="pending-events-modal__label">Location</span>
                    <p>{selectedEvent.location || "-"}</p>
                  </div>

                  <div className="pending-events-modal__info-card">
                    <span className="pending-events-modal__label">Paid Event</span>
                    <p>{selectedEvent.ispaid ? "Yes" : "No"}</p>
                  </div>

                  {selectedEvent.ispaid && (
                    <div className="pending-events-modal__info-card">
                      <span className="pending-events-modal__label">Ticket Price</span>
                      <p>{selectedEvent.ticketPrice || "-"}</p>
                    </div>
                  )}

                  {selectedEvent.pdf && (
                    <div className="pending-events-modal__info-card">
                      <span className="pending-events-modal__label">Proposal PDF</span>
                      <a
                        href={`http://localhost:5000/uploads/${selectedEvent.pdf}`}
                        target="_blank"
                        rel="noreferrer"
                        className="pending-events-modal__link"
                      >
                        View PDF
                      </a>
                    </div>
                  )}
                </div>

                {selectedEvent.image && (
                  <div className="pending-events-modal__image-wrap">
                    <img
                      src={`http://localhost:5000/uploads/${selectedEvent.image}`}
                      alt="Event"
                      className="pending-events-modal__image"
                    />
                  </div>
                )}
              </div>

              <div className="pending-events-modal__actions">
                <button
                  className="pending-event-btn pending-event-btn--approve"
                  onClick={() => handleApprove(selectedEvent._id)}
                >
                  Approve
                </button>

                <button
                  className="pending-event-btn pending-event-btn--reject"
                  onClick={() => handleReject(selectedEvent._id)}
                >
                  Reject
                </button>

                <button
                  className="pending-event-btn pending-event-btn--close"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}