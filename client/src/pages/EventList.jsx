import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EventList.css";

const EventList = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/events")
      .then((res) => setEvents(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Error fetching events:", err);
        setEvents([]);
      });
  }, []);

  const handleClick = (event) => {
    if (event.ispaid) {
      alert(`Redirecting to payment for "${event.title}" ticket!`);
    } else {
      alert(`You joined "${event.title}" for free!`);
    }
  };

  return (
    <div className="event-component-container">
      <h2>Upcoming Events</h2>

      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div className="event-card" key={event._id}>
              <img
                src={event.imageUrl || "/placeholder.jpg"}
                alt={event.title}
                className="event-image"
              />
              <h3>{event.title}</h3>
              <p>Date: {new Date(event.date).toLocaleDateString()}</p>
              <p>Location: {event.location}</p>

              {event.ispaid ? (
                <button className="buy-btn" onClick={() => handleClick(event)}>
                  Buy
                </button>
              ) : (
                <button className="free-btn" onClick={() => handleClick(event)}>
                  Go for Free
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;