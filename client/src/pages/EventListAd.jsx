import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./EventList.css";

const EventList = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/events");
      const safeData = Array.isArray(res.data) ? res.data : [];

      const approvedEvents = safeData.filter(
        (event) => (event?.status || "").toLowerCase() === "approved"
      );

      setEvents(approvedEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (_id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/events/${_id}`);
      setEvents((prev) => prev.filter((event) => event._id !== _id));
      alert("Event deleted successfully!");

      if (selectedEvent?._id === _id) {
        setSelectedEvent(null);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting event");
    }
  };

  const filteredEvents = useMemo(() => {
  const term = search.trim().toLowerCase();
  if (!term) return events;

  return events.filter((event) => {
    const title = event?.title || "";
    const location = event?.location || "";
    const description = event?.description || "";
    const clubid = event?.clubid || "";

    const dateText = event?.date
      ? new Date(event.date).toLocaleDateString("en-GB").toLowerCase()
      : "";

    const isoDate = event?.date
      ? new Date(event.date).toISOString().toLowerCase()
      : "";

    return (
      title.toLowerCase().includes(term) ||
      location.toLowerCase().includes(term) ||
      description.toLowerCase().includes(term) ||
      clubid.toLowerCase().includes(term) ||
      dateText.includes(term) ||
      isoDate.includes(term)
    );
  });
}, [events, search]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = filteredEvents.filter((event) => {
    if (!event?.date) return false;
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  const finishedEvents = filteredEvents.filter((event) => {
    if (!event?.date) return false;
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  });

  const renderEventCard = (event, showUnpublish = false) => {
    // ✅ FIXED IMAGE LOGIC
    const imageSrc =
      event?.image && event.image.trim() !== ""
        ? `http://localhost:5000/uploads/${event.image}`
        : "https://via.placeholder.com/300x200?text=Event+Image";

    return (
      <div className="admin-event-card glass-card-events" key={event._id}>
        <div className="admin-event-card__image-wrap">
          <img
            src={imageSrc}
            alt={event.title}
            className="admin-event-card__image"
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/300x200?text=Event+Image";
            }}
          />
          <span className="admin-event-status">
            {new Date(event.date) < today ? "Finished" : "Upcoming"}
          </span>
        </div>

        <div className="admin-event-card__body">
          <h3>{event?.title || "Untitled Event"}</h3>

          <div className="admin-event-meta">
            <p>
              <strong>Date:</strong>{" "}
              {event?.date ? new Date(event.date).toLocaleDateString() : "-"}
            </p>
            <p>
              <strong>Location:</strong> {event?.location || "-"}
            </p>
            <p>
              <strong>Type:</strong>{" "}
              {event?.ispaid
                ? `Paid (Rs. ${event?.ticketPrice || 0})`
                : "Free"}
            </p>
          </div>

          <p className="admin-event-description">
            {event?.description || "No description available."}
          </p>

          <div className="admin-event-actions">
            <button
              type="button"
              className="admin-event-view-btn"
              onClick={() => setSelectedEvent(event)}
            >
              View
            </button>

            {showUnpublish && (
              <button
                type="button"
                className="admin-event-delete-btn"
                onClick={() => handleDelete(event._id)}
              >
                Unpublish
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-events-page">
      <div className="admin-events-bg"></div>

      <div className="admin-events-container">
        <section className="admin-events-header glass-card-events">
          <div>
            <h1>All Approved Events</h1>
          </div>

          <button
            type="button"
            className="admin-events-back-btn"
            onClick={() => navigate("/superadmin/control-panel")}
          >
            &#8617; Go Back
          </button>
        </section>

        <section className="admin-events-stats">
          <div className="admin-events-stat-card glass-card-events">
            <span className="admin-events-stat-label">TOTAL APPROVED EVENTS</span>
            <h2>{events.length}</h2>
          </div>

          <div className="admin-events-stat-card glass-card-events">
            <span className="admin-events-stat-label">SHOWING RESULTS</span>
            <h2>{filteredEvents.length}</h2>
          </div>
        </section>

        <section className="admin-events-toolbar glass-card-events">
          <input
            type="text"
            className="admin-events-search-input"
            placeholder="Search by title, location,date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            type="button"
            className="admin-events-refresh-btn"
            onClick={fetchEvents}
          >
            Refresh
          </button>
        </section>

        {loading ? (
          <div className="admin-events-message glass-card-events">
            Loading events...
          </div>
        ) : (
          <>
            <section className="admin-events-section">
              <div className="admin-events-section__header glass-card-events">
                <h2>Upcoming Events</h2>
                <span>{upcomingEvents.length}</span>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="admin-events-message glass-card-events">
                  No upcoming approved events found.
                </div>
              ) : (
                <div className="admin-events-grid">
                  {upcomingEvents.map((event) => renderEventCard(event, false))}
                </div>
              )}
            </section>

            <section className="admin-events-section">
              <div className="admin-events-section__header glass-card-events">
                <h2>Finished Events</h2>
                <span>{finishedEvents.length}</span>
              </div>

              {finishedEvents.length === 0 ? (
                <div className="admin-events-message glass-card-events">
                  No finished approved events found.
                </div>
              ) : (
                <div className="admin-events-grid">
                  {finishedEvents.map((event) => renderEventCard(event, true))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {selectedEvent && (
        <div
          className="admin-events-modal-overlay"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="admin-events-modal glass-card-events"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-events-modal-header">
              <div>
                <h3>{selectedEvent?.title || "Event Details"}</h3>
                <p className="admin-events-modal-subtitle">
                  Complete information about the selected event.
                </p>
              </div>

              <button
                type="button"
                className="admin-events-close-btn"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </button>
            </div>

            <div className="admin-events-details-grid">
              <div className="admin-events-detail-box">
                <span>Title</span>
                <p>{selectedEvent?.title || "-"}</p>
              </div>

              <div className="admin-events-detail-box">
                <span>Date</span>
                <p>
                  {selectedEvent?.date
                    ? new Date(selectedEvent.date).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              <div className="admin-events-detail-box">
                <span>Location</span>
                <p>{selectedEvent?.location || "-"}</p>
              </div>

              <div className="admin-events-detail-box">
                <span>Type</span>
                <p>
                  {selectedEvent?.ispaid
                    ? `Paid (Rs. ${selectedEvent?.ticketPrice || 0})`
                    : "Free"}
                </p>
              </div>

              <div className="admin-events-detail-box">
                <span>Status</span>
                <p>{selectedEvent?.status || "-"}</p>
              </div>

              <div className="admin-events-detail-box admin-events-detail-box--full">
                <span>Description</span>
                <p>{selectedEvent?.description || "No description available."}</p>
              </div>
            </div>

            <div className="admin-events-modal-actions">
              <button
                type="button"
                className="admin-event-view-btn"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;