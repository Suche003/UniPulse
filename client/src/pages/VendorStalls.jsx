import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import "./VendorStalls.css";

const VendorStalls = () => {
  const [eventsWithStalls, setEventsWithStalls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventsAndStalls = async () => {
      try {
        const eventsRes = await axios.get("http://localhost:5000/api/events");
        const events = Array.isArray(eventsRes.data) ? eventsRes.data : [];

        const stallsRes = await axios.get("http://localhost:5000/api/stalls");
        const stalls = Array.isArray(stallsRes.data) ? stallsRes.data : [];

        // Get today's date (midnight)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Only future events (not today, not past)
        const futureEvents = events.filter(
          (event) => new Date(event.date) > today
        );

        // Group stalls under future events
        const grouped = futureEvents.map((event) => ({
          ...event,
          stalls: stalls
            .filter((stall) => stall.eventid === event.eventid)
            .map((s) => ({ ...s, title: event.title })),
        }));

        setEventsWithStalls(grouped);
      } catch (err) {
        console.error("Error fetching events or stalls:", err);
        setEventsWithStalls([]);
      }
    };

    fetchEventsAndStalls();
  }, []);

  const handleBookStall = (stall) => {
    navigate(`/booking-stalls/${stall.eventid}`, { state: { stall } });
  };

  return (
    <div className="vendor-stalls-container">
      <h1>Upcoming Event Stalls</h1>

      {eventsWithStalls.length === 0 ? (
        <p>No upcoming events or stalls available.</p>
      ) : (
        eventsWithStalls.map((event) => (
          <div key={event.eventid} className="vendor-event-section">

            {/* Event Header */}
            <div className="vendor-event-header">
              <h2 className="vendor-event-title">{event.title}</h2>
              {event.date && (
                <span className="vendor-event-date">
                  <FontAwesomeIcon icon={faCalendarAlt} />{" "}
                  {new Date(event.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            {event.stalls.length === 0 ? (
              <p>No stalls for this event.</p>
            ) : (
              <div className="vendor-stalls-grid">
                {event.stalls.map((stall) => (
                  <div
                    className="vendor-stall-card"
                    key={stall.stallId}
                    data-availability={
                      stall.availableStalls > 0 ? "Available" : "Unavailable"
                    }
                  >
                    <div className="vendor-stall-horizontal">
                      {stall.image && (
                        <div className="vendor-stall-image-container">
                          <img src={stall.image} alt={stall.category} />
                        </div>
                      )}

                      <div className="vendor-stall-details">
                        <p>{stall.category} Stall</p>
                        <p>Rs. {stall.price}</p>
                        {stall.location && <p>Location: {stall.location}</p>}
                        <p>Available Stalls: {stall.availableStalls}</p>
                        {stall.description && <p>{stall.description}</p>}

                        <button
                          className="vendor-book-btn"
                          onClick={() => handleBookStall(stall)}
                          disabled={stall.availableStalls === 0}
                        >
                          {stall.availableStalls > 0 ? "Book" : "Unavailable"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default VendorStalls;