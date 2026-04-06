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
  const handleDelete = async (_id) => {
    try {
      await axios.delete(`http://localhost:5000/api/events/${_id}`);
      setEvents(events.filter((event) => event._id !== _id));
      alert("Event deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error deleting event");
    }
  };

  

  return (
    <div className="event-component-container">
      <h2>Upcoming Events</h2>

      {events.length === 0 ?
       (
        <p>No events found.</p>
      ) 

      : (
        <div className="events-grid">
          {events.map((event) => (
            <div className="event-card" key={event._id}>
              <img
                src={`http://localhost:5000/api/events/${event.image}` || "/placeholder.jpg"}
                alt={event.title}
                className="event-image"
              />

              <h3>{event.title}</h3>
              <p>Date: {new Date(event.date).toLocaleDateString()}</p>
              <p>Location: {event.location}</p>

              <div className="button-group">
                

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(event._id)}
                >
                  Delete
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