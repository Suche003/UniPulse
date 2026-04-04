import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import "./Stalls.css";

const Stalls = () => {
  const { eventid } = useParams();
  const navigate = useNavigate();
  const [stalls, setStalls] = useState([]);
  const [eventTitle, setEventTitle] = useState("");

  useEffect(() => {
    if (!eventid) return;

    const fetchStalls = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/stalls/event/${eventid}`);
        setStalls(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching stalls:", err);
        setStalls([]);
      }
    };

    const fetchEvent = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/events`);
        const event = res.data.find(e => e.eventid === eventid);
        setEventTitle(event ? event.title : eventid);
      } catch (err) {
        console.error("Error fetching event:", err);
        setEventTitle(eventid);
      }
    };

    fetchStalls();
    fetchEvent();
  }, [eventid]);

  const handleAddStall = () => {
    navigate(`/stalls/${eventid}/add`, { state: { eventTitle } });
  };

  const handleEdit = (stall) => {
    navigate(`/stalls/${eventid}/edit/${stall.stallId}`, { state: { stall, eventTitle } });
  };

  const handleDelete = async (stallId) => {
    if (!window.confirm("Are you sure you want to delete this stall?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/stalls/event/${eventid}/${stallId}`);
      setStalls(stalls.filter(stall => stall.stallId !== stallId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete stall");
    }
  };

  return (
    <div className="stalls-container">
      <h2 className="event-stalls-heading">{eventTitle} Event Stalls</h2>

      <button className="add-stall-btn" onClick={handleAddStall}>
        Add Stall
      </button>

      {stalls.length === 0 ? (
        <p>No stalls available for this event.</p>
      ) : (
        <div className="stalls-grid">
          {stalls.map((stall) => (
            <div className="stall-card" key={stall.stallId}>
              {/* Image on top */}
              {stall.image && (
                <div className="stall-image-container">
                  <img src={stall.image} alt={stall.category} className="stall-image" />
                </div>
              )}

              <div className="stall-details">
                <p><span className="field-name">Stall ID:</span> {stall.stallId}</p>
                <p><span className="field-name">Category:</span> {stall.category}</p>
                <p><span className="field-name">Price:</span> Rs. {stall.price}</p>
                {stall.location && <p><span className="field-name">Location:</span> {stall.location}</p>}
                <p><span className="field-name">Status:</span> {stall.status}</p>
                <p><span className="field-name">Available Stalls:</span> {stall.availableStalls}</p>
                {stall.description && <p><span className="field-name">Description:</span> {stall.description}</p>}

                <div className="stall-actions">
                  <button onClick={() => handleEdit(stall)} className="action-btn edit-btn">
                    <FiEdit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(stall.stallId)} className="action-btn delete-btn">
                    <FiTrash2 className="icon" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Stalls;