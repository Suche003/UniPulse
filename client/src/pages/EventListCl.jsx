import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EventList.css";
import { useNavigate } from "react-router-dom";

const EventListCl = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate(); // ✅ REQUIRED

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/events/all")
      .then((res) => setEvents(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Error fetching events:", err);
        setEvents([]);
      });
  }, []);

  return (
    <div className="event-component-container">
      <h2>All Events</h2>

      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div className="event-card" key={event._id}>
              
              {/* IMAGE */}
              <img
                src={
                  event.image
                    ? `http://localhost:5000/api/events/${event.image}`
                    : "/placeholder.jpg"
                }
                alt={event.title}
                className="event-image"
              />

              {/* DETAILS */}
              <h3>{event.title}</h3>
              <p>Date: {new Date(event.date).toLocaleDateString()}</p>
              <p>Location: {event.location}</p>
              <p>Status: {event.status}</p>

              {/* UPDATE BUTTON (ONLY PENDING) */}
              {event.status === "pending" && (
                <button
                  onClick={() => navigate(`club/update-event/${event._id}`)}
                >
                  Update Event
                </button>
              )}

              {/* DELETE BUTTON (ONLY REJECTED) */}
              {event.status === "rejected" && (
                <button onClick={() => alert("Delete logic here")}>
                  Delete
                </button>
              )}

              {/* REQUEST AGAIN (ONLY REJECTED) */}
              {event.status === "rejected" && (
                <button
                  onClick={() => navigate(`/update-event/${event._id}`)}
                >
                  Request Event
                </button>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventListCl;