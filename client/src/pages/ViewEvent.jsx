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

  if (loading) return <p style={{ color: "#fff" }}>Loading event details...</p>;
  if (!eventData) return <p style={{ color: "#fff" }}>Event not found</p>;

  const imageUrl =
    eventData?.image && eventData.image.trim() !== ""
      ? `http://localhost:5000/uploads/${eventData.image}`
      : null;

  const pdfUrl =
    eventData?.pdf && eventData.pdf.trim() !== ""
      ? `http://localhost:5000/uploads/${eventData.pdf}`
      : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px",
        fontFamily: "Arial",
        color: "#fff",
        background:
          "radial-gradient(circle at top left, rgba(255, 0, 102, 0.14), transparent 25%)," +
          "radial-gradient(circle at top right, rgba(139, 92, 246, 0.15), transparent 30%)," +
          "linear-gradient(135deg, #0b0b14 0%, #111827 45%, #1a1030 100%)",
      }}
    >
      {/* BACK BUTTON */}
      <div style={{ marginBottom: "20px" }}>
        <Link
          to="/club/dashboard"
          style={{
            background: "linear-gradient(90deg, #ec4899, #8b5cf6)",
            padding: "10px 18px",
            borderRadius: "14px",
            color: "#fff",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* CENTER WRAPPER */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        {/* MAIN CARD */}
        <div
          style={{
            width: "100%",
            maxWidth: "900px",
            borderRadius: "24px",
            padding: "25px",
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 15px 40px rgba(0,0,0,0.35)",
          }}
        >
          {/* TITLE ONLY */}
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "800",
              textAlign: "center",
            }}
          >
            {eventData.title}
          </h1>

          {/* DESCRIPTION */}
          <p style={{ color: "#cbd5e1", textAlign: "center" }}>
            {eventData.description}
          </p>

          {/* CONTENT */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            {/* IMAGE */}
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Event"
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  height: "280px",
                  objectFit: "cover",
                  borderRadius: "16px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  height: "280px",
                  background: "rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "16px",
                  color: "#888",
                }}
              >
                No Image uploaded
              </div>
            )}

            {/* DETAILS (BOTTOM SECTION) */}
            <div
              style={{
                width: "100%",
                marginTop: "10px",
                paddingTop: "15px",
                borderTop: "1px solid rgba(255,255,255,0.15)",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                color: "#fff",
              }}
            >
              <div>
                <strong>Date:</strong>{" "}
                {new Date(eventData.date).toLocaleString()}
              </div>

              <div>
                <strong>Location:</strong> {eventData.location}
              </div>

              <div>
                <strong>Paid Event:</strong>{" "}
                {eventData.ispaid ? "Yes" : "No"}
              </div>

              {eventData.ispaid && (
                <div>
                  <strong>Ticket Price:</strong> {eventData.ticketPrice}
                </div>
              )}
            </div>

            {/* PDF */}
            <div style={{ marginTop: "10px" }}>
              {pdfUrl ? (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "linear-gradient(90deg, #ec4899, #8b5cf6)",
                    padding: "10px 16px",
                    borderRadius: "12px",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: "bold",
                    display: "inline-block",
                  }}
                >
                  View PDF
                </a>
              ) : (
                <span style={{ color: "#888" }}>No PDF uploaded</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}