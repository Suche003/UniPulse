import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

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

  if (loading) return <p>Loading event details...</p>;
  if (!eventData) return <p>Event not found</p>;

  const imageUrl =
    eventData?.image && eventData.image.trim() !== ""
      ? `http://localhost:5000/uploads/${eventData.image}`
      : null;

  const pdfUrl =
    eventData?.pdf && eventData.pdf.trim() !== ""
      ? `http://localhost:5000/uploads/${eventData.pdf}`
      : null;

  // ✅ Gradient Button Style
  const buttonStyle = {
    background: "linear-gradient(90deg, #ff2d75, #7b2ff7)",
    color: "#fff",
    borderRadius: "25px",
    padding: "12px 22px",
    fontWeight: "bold",
    textDecoration: "none",
    display: "inline-block",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    border: "none",
  };

  // ✅ Hover Effects
  const buttonHover = (e) => {
    e.target.style.transform = "translateY(-2px)";
    e.target.style.boxShadow = "0 6px 15px rgba(0,0,0,0.4)";
  };

  const buttonLeave = (e) => {
    e.target.style.transform = "translateY(0)";
    e.target.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      
      {/* BACK BUTTON */}
      <div style={{ marginBottom: "15px" }}>
        <Link
          to="/club/dashboard"
          style={buttonStyle}
          onMouseEnter={buttonHover}
          onMouseLeave={buttonLeave}
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* TITLE & DESCRIPTION */}
      <h1 style={{ fontSize: "1.8rem", marginBottom: "8px", color: "#fff" }}>
        {eventData.title}
      </h1>

      <p style={{ fontSize: "1rem", marginBottom: "15px", color: "#fff" }}>
        {eventData.description}
      </p>

      {/* EVENT CARD */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          alignItems: "flex-start",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        {/* IMAGE + PDF */}
        <div style={{ flex: "0 0 300px" }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Event"
              style={{
                width: "300px",
                height: "200px",
                objectFit: "cover",
                borderRadius: "4px",
                marginBottom: "5px",
              }}
              onError={(e) =>
                (e.target.src =
                  "https://via.placeholder.com/300x200?text=No+Image")
              }
            />
          ) : (
            <div
              style={{
                width: "300px",
                height: "200px",
                background: "#eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#888",
                marginBottom: "5px",
                borderRadius: "4px",
              }}
            >
              No Image uploaded
            </div>
          )}

          {/* PDF BUTTON */}
          <div style={{ marginTop: "5px" }}>
            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={buttonStyle}
                onMouseEnter={buttonHover}
                onMouseLeave={buttonLeave}
              >
                View PDF
              </a>
            ) : (
              <span style={{ fontSize: "0.85rem", color: "#888" }}>
                No PDF uploaded
              </span>
            )}
          </div>
        </div>

        {/* DETAILS */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            color: "#fff",
          }}
        >
          <div>
            <strong>Date:</strong>{" "}
            {new Date(eventData.date).toLocaleDateString()}{" "}
            {new Date(eventData.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          <div>
            <strong>Location:</strong> {eventData.location}
          </div>

          <div>
            <strong>Paid Event:</strong> {eventData.ispaid ? "Yes" : "No"}
          </div>

          {eventData.ispaid && (
            <div>
              <strong>Ticket Price:</strong> {eventData.ticketPrice}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}