import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import "./Stalls.css";

const Stalls = () => {
  const { eventid } = useParams();
  const navigate = useNavigate();

  const [stalls, setStalls] = useState([]);
  const [eventTitle, setEventTitle] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStalls();
    fetchEvent();
  }, [eventid]);

  const fetchStalls = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/stalls/event/${eventid}`
      );
      setStalls(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvent = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events");
      const event = res.data.find((e) => e.eventid === eventid);
      setEventTitle(event ? event.title : eventid);
    } catch {
      setEventTitle(eventid);
    }
  };

  const handleAddStall = () =>
    navigate(`/stalls/${eventid}/add`, { state: { eventTitle } });

  const handleEdit = (stall) =>
    navigate(`/stalls/${eventid}/edit/${stall.stallId}`, {
      state: { stall, eventTitle },
    });

  const handleDelete = async (stallId) => {
    if (!window.confirm("Are you sure you want to delete this stall?")) return;

    await axios.delete(
      `http://localhost:5000/api/stalls/event/${eventid}/${stallId}`
    );

    setStalls((prev) => prev.filter((s) => s.stallId !== stallId));
  };

  const filteredStalls = useMemo(() => {
    const t = search.toLowerCase();
    if (!t) return stalls;

    return stalls.filter(
      (s) =>
        s.category?.toLowerCase().includes(t) ||
        s.price?.toString().includes(t) ||
        s.location?.toLowerCase().includes(t)
    );
  }, [stalls, search]);

  return (
    <div className="stalls-page">
      <div className="admin-events-container">

        {/* HEADER */}
        <section className="admin-events-header glass-card-events">
          <h1>{eventTitle} - Stalls</h1>

          <button
            className="admin-events-back-btn"
            onClick={() => navigate("/club/dashboard")}
          >
            &#8617; Go Back
          </button>
        </section>

        {/* STATS */}
        <section className="stalls-stats-row glass-card-events">
          <div>
            <span>Total Stalls</span>
            <h2>{stalls.length}</h2>
          </div>

          <button
            className="stalls-create-btn"
            onClick={handleAddStall}
          >
            + Create Stall
          </button>
        </section>

        {/* SEARCH */}
        <section className="admin-events-toolbar glass-card-events">
          <input
            className="admin-events-search-input"
            placeholder="Search by Category, Price, Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* REFRESH BUTTON */}
          <button
            className="admin-events-refresh-btn"
            onClick={() => {
              setSearch("");   
              fetchStalls();   
            }}
          >
            Refresh
          </button>
        </section>

        {/* CONTENT */}
        {loading ? (
          <div className="admin-events-message glass-card-events">
            Loading...
          </div>
        ) : filteredStalls.length === 0 ? (
          <div className="admin-events-message glass-card-events">
            No stalls found
          </div>
        ) : (
          <div className="stalls-grid">
            {filteredStalls.map((stall) => (
              <div
                className="stalls-card glass-card-events"
                key={stall.stallId}
              >

                {/* IMAGE */}
                <div className="stalls-card__image-wrap">
                  <img
                    src={stall.image || "/placeholder.jpg"}
                    alt={stall.category}
                    className="stalls-card__image"
                  />

                  <span className="stalls-status">
                    Available: {stall.availableStalls}
                  </span>
                </div>

                {/* BODY */}
                <div className="stalls-card__body">

                  <h3>{stall.category} Stall</h3>

                  <div className="stalls-meta">
                    <p><strong>ID:</strong> {stall.stallId}</p>
                    <p><strong>Price:</strong> Rs. {stall.price}</p>
                    <p><strong>Location:</strong> {stall.location || "-"}</p>
                  </div>

                  <p className="stalls-description">
                    {stall.description || "No description available"}
                  </p>

                  <div className="stalls-actions">

                    <button
                      className="stalls-edit-btn"
                      onClick={() => handleEdit(stall)}
                    >
                      <FiEdit />
                    </button>

                    <button
                      className="stalls-delete-btn"
                      onClick={() => handleDelete(stall.stallId)}
                    >
                      <FiTrash2 />
                    </button>

                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Stalls;