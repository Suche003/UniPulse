import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import "./VendorStalls.css";

const VendorStalls = () => {
  const [eventsWithStalls, setEventsWithStalls] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventsAndStalls = async () => {
      try {
        setLoading(true);

        const eventsRes = await axios.get("http://localhost:5000/api/events");
        const events = Array.isArray(eventsRes.data) ? eventsRes.data : [];

        const stallsRes = await axios.get("http://localhost:5000/api/stalls");
        const stalls = Array.isArray(stallsRes.data) ? stallsRes.data : [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const futureEvents = events.filter(
          (event) => new Date(event.date) > today
        );

        const grouped = futureEvents
          .map((event) => {
            const eventStalls = stalls.filter(
              (stall) => String(stall.eventid) === String(event.eventid)
            );

            if (eventStalls.length === 0) return null;

            return { ...event, stalls: eventStalls };
          })
          .filter(Boolean);

        setEventsWithStalls(grouped);
      } catch (err) {
        console.error(err);
        setEventsWithStalls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEventsAndStalls();
  }, []);

  
  const handleBookStall = (stall, event) => {
    navigate(`/booking-stalls/${stall.eventid}`, {
      state: {
        stall: {
          ...stall,
          eventTitle: event.title,  
        },
      },
    });
  };

  const searchLower = search.toLowerCase();
  const isSearching = search.trim() !== "";
  const isPriceSearch = !isNaN(search) && search !== "";
  const priceValue = parseFloat(search);

  return (
    <div className="vendor-page">
      <div className="vendor-container">

        <section className="admin-events-header glass-card-events">
          <div>
            <h1>Upcoming Event Stalls</h1>
          </div>

          <button
            className="admin-events-back-btn"
            onClick={() => navigate("/vendor/dashboard")}
          >
            &#8617; Go Back
          </button>
        </section>

        <section className="admin-events-toolbar glass-card-events">
          <input
            type="text"
            className="admin-events-search-input"
            placeholder="Search by Event, Category, or Price..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="admin-events-refresh-btn"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </section>

        {loading ? (
          <div className="admin-events-message glass-card-events">
            Loading stalls...
          </div>
        ) : eventsWithStalls.length === 0 ? (
          <div className="admin-events-message glass-card-events">
            No upcoming events or stalls available.
          </div>
        ) : (
          eventsWithStalls.map((event) => {
            const filteredStalls = isSearching
              ? event.stalls.filter((stall) => {
                  const matchesEvent = event.title
                    .toLowerCase()
                    .includes(searchLower);

                  const matchesCategory = stall.category
                    .toLowerCase()
                    .includes(searchLower);

                  const matchesPrice =
                    isPriceSearch && stall.price === priceValue;

                  return matchesEvent || matchesCategory || matchesPrice;
                })
              : event.stalls;

            if (isSearching && filteredStalls.length === 0) return null;

            return (
              <div key={event.eventid} className="vendor-event-section">

                <div className="admin-events-section__header glass-card-events">
                  <h2>{event.title}</h2>

                  <span className="vendor-date-text">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    {new Date(event.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="vendor-stalls-grid">
                  {filteredStalls.map((stall) => (
                    <div
                      key={stall.stallId}
                      className="vendor-stall-card glass-card"
                      data-availability={
                        stall.availableStalls > 0
                          ? "Available"
                          : "Unavailable"
                      }
                    >
                      {stall.image && (
                        <div className="vendor-stall-image-container">
                          <img src={stall.image} alt={stall.category} />
                        </div>
                      )}

                      <div className="vendor-stall-details">
                        <h3>{stall.category} Stall</h3>
                        <p>Rs. {stall.price}</p>

                        {stall.location && (
                          <p>Location: {stall.location}</p>
                        )}

                        <p>Available: {stall.availableStalls}</p>

                  
                        <button
                          className="vendor-book-btn"
                          onClick={() => handleBookStall(stall, event)}
                          disabled={stall.availableStalls === 0}
                        >
                          {stall.availableStalls > 0
                            ? "Book Now"
                            : "Unavailable"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VendorStalls;