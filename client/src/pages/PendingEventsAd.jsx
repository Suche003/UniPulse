import { useEffect, useState } from "react";
import axios from "axios";
import "./PendingEvents.css";

export default function AdminPendingEvents() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchPendingEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events/pending");
      setEvents(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/events/approve/${id}`);
      setMessage("Event Approved Successfully ✅");
      fetchPendingEvents();
      setSelectedEvent(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/events/reject/${id}`);
      setMessage("Event Rejected ❌");
      fetchPendingEvents();
      setSelectedEvent(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="admin-page">
      <h1>Pending Event Requests</h1>

      {error && <p className="message error">{error}</p>}
      {message && <p className="message success">{message}</p>}

      <table className="events-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 ? (
            <tr>
              <td colSpan="2" className="no-data">
                No pending events
              </td>
            </tr>
          ) : (
            events.map((event) => (
              <tr key={event._id}>
                <td>{event.title}</td>
                <td>
                  <button onClick={() => setSelectedEvent(event)}>View</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selectedEvent && (
        <div className="modal">
          <h3>{selectedEvent.title}</h3>
          <p><strong>Description:</strong> {selectedEvent.description}</p>
          <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
          <p><strong>Location:</strong> {selectedEvent.location}</p>
          <p><strong>Paid:</strong> {selectedEvent.ispaid ? "Yes" : "No"}</p>
          {selectedEvent.ispaid && <p><strong>Ticket Price:</strong> {selectedEvent.ticketPrice}</p>}

          {selectedEvent.pdf && (
            <p>
              <a
                href={`http://localhost:5000/uploads/${selectedEvent.pdf}`}
                target="_blank"
                rel="noreferrer"
              >
                View PDF
              </a>
            </p>
          )}

          {selectedEvent.image && (
            <img
              src={`http://localhost:5000/uploads/${selectedEvent.image}`}
              alt="Event"
            />
          )}

          <div className="buttons">
            <button onClick={() => handleApprove(selectedEvent._id)}>Approve</button>
            <button onClick={() => handleReject(selectedEvent._id)}>Reject</button>
            <button onClick={() => setSelectedEvent(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}