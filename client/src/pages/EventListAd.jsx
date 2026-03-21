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

  // DELETE EVENT
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`);
      setEvents(events.filter((event) => event._id !== id));
      alert("Event deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error deleting event");
    }
  };

  // UPDATE EVENT (just demo alert - later connect form/page)
  const handleUpdate = (event) => {
    alert(`Update event: ${event.title}`);
    // You can navigate to update page here
  };

  // MANAGE STALL
  const handleManageStall = (event) => {
    alert(`Manage stalls for: ${event.title}`);
    // Navigate to stall management page
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

              <div className="button-group">
                <button
                  className="update-btn"
                  onClick={() => handleUpdate(event)}
                >
                  Update
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(event._id)}
                >
                  Delete
                </button>

                <button
                  className="stall-btn"
                  onClick={() => handleManageStall(event)}
                >
                  Manage Stall
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;