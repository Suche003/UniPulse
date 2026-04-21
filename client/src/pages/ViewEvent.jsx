import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./ViewEvent.css";

export default function ViewEvent() {
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/events/${id}`)
      .then((res) => {
        setEventData(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load event");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="view-event-page">
        <div className="view-event-container">
          <div className="view-event-message">Loading event details...</div>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="view-event-page">
        <div className="view-event-container">
          <div className="view-event-message view-event-message--error">
            Event not found
          </div>
        </div>
      </div>
    );
  }

  const imageUrl =
    eventData?.image && eventData.image.trim() !== ""
      ? `http://localhost:5000/uploads/${eventData.image}`
      : null;

  const pdfUrl =
    eventData?.pdf && eventData.pdf.trim() !== ""
      ? `http://localhost:5000/uploads/${eventData.pdf}`
      : null;

  const formattedDate = eventData?.date
    ? new Date(eventData.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const formattedTime = eventData?.date
    ? new Date(eventData.date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  return (
    <div className="view-event-page">
      <div className="view-event-container">
        <div className="view-event-topbar">
          <Link to="/club/dashboard" className="view-event-back-btn">
            <span>&#8617;</span> Go Back to Dashboard
          </Link>
        </div>

        <section className="view-event-hero">
          <div className="view-event-hero__content">
            <span className="view-event-badge">
              {eventData.status || "Event"}
            </span>
            <h1 className="view-event-title">{eventData.title}</h1>
            <p className="view-event-description">
              {eventData.description || "No description available."}
            </p>
          </div>
          <div className="view-event-hero__glow"></div>
        </section>

        <section className="view-event-card">
          <div className="view-event-media">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={eventData.title || "Event"}
                className="view-event-image"
                onError={(e) => {
                  e.target.style.display = "none";
                  const fallback = e.target.nextElementSibling;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}

            <div
              className="view-event-image-placeholder"
              style={{ display: imageUrl ? "none" : "flex" }}
            >
              No Image Uploaded
            </div>

            <div className="view-event-pdf-wrap">
              {pdfUrl ? (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-event-btn"
                >
                  View PDF
                </a>
              ) : (
                <span className="view-event-empty-text">No PDF uploaded</span>
              )}
            </div>
          </div>

          <div className="view-event-details">
            <div className="view-event-details-header">
              <h2>Event Details</h2>
            </div>

            <div className="view-event-details-grid">
              <div className="view-event-detail-item">
                <span className="view-event-detail-label">Event ID</span>
                <span className="view-event-detail-value">
                  {eventData.eventid || "N/A"}
                </span>
              </div>

              <div className="view-event-detail-item">
                <span className="view-event-detail-label">Date</span>
                <span className="view-event-detail-value">{formattedDate}</span>
              </div>

              <div className="view-event-detail-item">
                <span className="view-event-detail-label">Time</span>
                <span className="view-event-detail-value">{formattedTime}</span>
              </div>

              <div className="view-event-detail-item">
                <span className="view-event-detail-label">Location</span>
                <span className="view-event-detail-value">
                  {eventData.location || "Not specified"}
                </span>
              </div>

              <div className="view-event-detail-item">
                <span className="view-event-detail-label">Paid Event</span>
                <span className="view-event-detail-value">
                  {eventData.ispaid ? "Yes" : "No"}
                </span>
              </div>

              {eventData.ispaid && (
                <div className="view-event-detail-item">
                  <span className="view-event-detail-label">Ticket Price</span>
                  <span className="view-event-detail-value">
                    Rs. {eventData.ticketPrice}
                  </span>
                </div>
              )}

              <div className="view-event-detail-item">
                <span className="view-event-detail-label">Status</span>
                <span className="view-event-detail-value status-text">
                  {eventData.status || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}