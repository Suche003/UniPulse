import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./StudentDashboard.css";

function formatDate(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [student, setStudent] = useState(null);
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [feedbackSubmittedIds, setFeedbackSubmittedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState(
    location.state?.paymentSuccessMessage || ""
  );

  useEffect(() => {
    fetchDashboardData();
    fetchMyEvents();
    fetchMyTickets();
    fetchFeedbackStatus();
  }, []);

  useEffect(() => {
    if (paymentSuccessMessage) {
      const timer = setTimeout(() => {
        setPaymentSuccessMessage("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [paymentSuccessMessage]);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("unipulse_token");

      const res = await axios.get(
        "http://localhost:5000/api/student/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStudent(res.data.student || null);
      setEvents(Array.isArray(res.data.events) ? res.data.events : []);
    } catch (err) {
      console.error("Error loading student dashboard:", err);
      setError(
        err.response?.data?.message || "Failed to load student dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyEvents() {
    try {
      const token = localStorage.getItem("unipulse_token");

      const res = await axios.get(
        "http://localhost:5000/api/student/events/my-events",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMyEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading my events:", err);
    }
  }

  async function fetchMyTickets() {
    try {
      const token = localStorage.getItem("unipulse_token");

      const res = await axios.get(
        "http://localhost:5000/api/student/tickets",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMyTickets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading my tickets:", err);
    }
  }

  async function fetchFeedbackStatus() {
    try {
      const token = localStorage.getItem("unipulse_token");

      const res = await axios.get(
        "http://localhost:5000/api/feedback/me/status",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedbackSubmittedIds(res.data?.submittedEventIds || []);
    } catch (err) {
      console.error("Error loading feedback status:", err);
    }
  }

  function getMyEventStatus(eventId) {
    return myEvents.find((item) => item.event?._id === eventId);
  }

  function getMyTicket(eventId) {
    return myTickets.find((item) => item.event?._id === eventId);
  }

  const upcomingEvents = useMemo(() => {
    const now = new Date();

    return [...events]
      .filter((event) => {
        if (!event?.date) return false;
        return new Date(event.date) >= now;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

  const filteredEvents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return upcomingEvents;

    return upcomingEvents.filter((event) => {
      return (
        event.title?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        event.eventid?.toLowerCase().includes(term)
      );
    });
  }, [upcomingEvents, searchTerm]);

  const mergedMyEvents = useMemo(() => {
    const mergedMap = new Map();

    myEvents.forEach((item) => {
      const eventId = item.event?._id;
      if (!eventId) return;

      mergedMap.set(eventId, {
        eventId,
        eventid: item.event?.eventid || "Event",
        title: item.event?.title || "Untitled Event",
        description: item.event?.description || "",
        date: item.event?.date,
        location: item.event?.location || "No location",
        price: item.event?.ticketPrice || 0,
        ispaid: item.event?.ispaid || false,
        status:
          item.paymentStatus === "approved"
            ? "purchased"
            : item.status === "going"
            ? "going"
            : item.status === "ticket_requested"
            ? "ticket_requested"
            : "joined",
      });
    });

    myTickets.forEach((ticket) => {
      const eventId = ticket.event?._id;
      if (!eventId) return;

      const existing = mergedMap.get(eventId);

      if (ticket.status === "paid") {
        mergedMap.set(eventId, {
          eventId,
          eventid: ticket.event?.eventid || existing?.eventid || "Ticket",
          title:
            ticket.eventName ||
            ticket.event?.title ||
            existing?.title ||
            "Paid Event",
          description: ticket.event?.description || existing?.description || "",
          date: ticket.eventDate || ticket.event?.date || existing?.date,
          location:
            ticket.event?.location || existing?.location || "No location",
          price: ticket.amount || existing?.price || 0,
          ispaid: true,
          status: "purchased",
        });
      } else if (!existing) {
        mergedMap.set(eventId, {
          eventId,
          eventid: ticket.event?.eventid || "Ticket",
          title: ticket.eventName || ticket.event?.title || "Ticket Event",
          description: ticket.event?.description || "",
          date: ticket.eventDate || ticket.event?.date,
          location: ticket.event?.location || "No location",
          price: ticket.amount || 0,
          ispaid: true,
          status: "ticket_requested",
        });
      }
    });

    return Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [myEvents, myTickets]);

  const activeMyEvents = useMemo(() => {
    const now = new Date();

    return mergedMyEvents.filter((item) => {
      if (!item.date) return false;
      return new Date(item.date) >= now;
    });
  }, [mergedMyEvents]);

  const pastMyEvents = useMemo(() => {
    const now = new Date();

    return mergedMyEvents.filter((item) => {
      if (!item.date) return false;
      return new Date(item.date) < now;
    });
  }, [mergedMyEvents]);

  return (
    <div className="student-page">
      <Navbar />

      <main className="student-dashboard-container">
        <section className="student-hero">
          <div className="student-hero__content">
            <p className="student-hero__tag">STUDENT DASHBOARD</p>

            <h1 className="student-hero__title">
              Welcome back, {student?.name || "Student"}
            </h1>

            <p className="student-hero__subtitle">
              Manage your personal event participation, ticket requests, and
              profile details from one place.
            </p>

            <div className="student-hero__actions">
              <button
                className="student-btn student-btn--primary"
                onClick={() => navigate("/student/profile")}
              >
                My Profile
              </button>
            </div>
          </div>

          <div className="student-info-card">
            <h3>Your Student Info</h3>

            <div className="student-info-list">
              <div className="student-info-row">
                <span>Registration No</span>
                <strong>{student?.regNo || "N/A"}</strong>
              </div>

              <div className="student-info-row">
                <span>Contact No</span>
                <strong>{student?.contact || "N/A"}</strong>
              </div>
            </div>
          </div>
        </section>

        {paymentSuccessMessage && (
          <div className="student-success-banner">
            {paymentSuccessMessage}
          </div>
        )}

        <section className="student-dual-grid">
          <div className="student-events-panel">
            <div className="student-panel-header">
              <div>
                <h2>Upcoming Events</h2>
                <p>Browse approved upcoming events from the UniPulse system.</p>
              </div>

              <div className="student-search-box">
                <input
                  type="text"
                  placeholder="Search events by title, event ID, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="student-empty-box">Loading dashboard...</div>
            ) : error ? (
              <div className="student-empty-box student-empty-box--error">
                {error}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="student-empty-box">
                No approved upcoming events found.
              </div>
            ) : (
              <div className="student-events-list">
                {filteredEvents.map((event) => {
                  const joined = getMyEventStatus(event._id);
                  const purchasedTicket = getMyTicket(event._id);

                  const isPurchased =
                    purchasedTicket?.status === "paid" ||
                    joined?.paymentStatus === "approved" ||
                    joined?.status === "purchased";

                  return (
                    <div className="student-event-card" key={event._id}>
                      <div className="student-event-main">
                        <div className="student-event-top">
                          <span className="student-event-category">
                            {event.eventid || "Event"}
                          </span>

                          <div className="student-badge-group">
                            <span
                              className={
                                event.ispaid
                                  ? "student-badge student-badge--paid"
                                  : "student-badge student-badge--free"
                              }
                            >
                              {event.ispaid ? "Paid Event" : "Free Event"}
                            </span>

                            {isPurchased ? (
                              <span className="student-badge student-badge--joined">
                                Purchased
                              </span>
                            ) : joined?.status === "going" ? (
                              <span className="student-badge student-badge--joined">
                                Going
                              </span>
                            ) : joined?.status === "ticket_requested" ? (
                              <span className="student-badge student-badge--pending">
                                Ticket Requested
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <h3>{event.title}</h3>

                        <p className="student-event-desc">
                          {event.description || "No description available."}
                        </p>

                        <div className="student-event-meta">
                          <span>📅 {formatDate(event.date)}</span>
                          <span>⏰ {formatTime(event.date)}</span>
                          <span>📍 {event.location || "No location"}</span>
                        </div>

                        {event.ispaid && (
                          <div className="student-ticket-price">
                            Ticket Price: Rs. {event.ticketPrice || 0}
                          </div>
                        )}
                      </div>

                      <div className="student-event-actions">
                        <Link
                          to={`/student/events/${event._id}`}
                          className="student-btn student-btn--ghost"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="student-events-panel student-events-panel--right">
            <div className="student-panel-header">
              <div>
                <h2>My Events</h2>
                <p>Your joined and purchased upcoming/current events.</p>
              </div>
            </div>

            {activeMyEvents.length === 0 ? (
              <div className="student-empty-box">
                No active joined events yet.
              </div>
            ) : (
              <div className="student-events-list">
                {activeMyEvents.map((item) => (
                  <div className="student-event-card" key={item.eventId}>
                    <div className="student-event-main">
                      <div className="student-event-top">
                        <span className="student-event-category">
                          {item.eventid}
                        </span>

                        <div className="student-badge-group">
                          {item.status === "going" && (
                            <span className="student-badge student-badge--joined">
                              Going
                            </span>
                          )}

                          {item.status === "ticket_requested" && (
                            <span className="student-badge student-badge--pending">
                              Ticket Requested
                            </span>
                          )}

                          {item.status === "purchased" && (
                            <span className="student-badge student-badge--joined">
                              Purchased
                            </span>
                          )}
                        </div>
                      </div>

                      <h3>{item.title}</h3>

                      <div className="student-event-meta">
                        <span>📅 {formatDate(item.date)}</span>
                        <span>⏰ {formatTime(item.date)}</span>
                        <span>📍 {item.location}</span>
                      </div>

                      {item.ispaid && (
                        <div className="student-ticket-price">
                          Ticket Price: Rs. {item.price || 0}
                        </div>
                      )}
                    </div>

                    <div className="student-event-actions">
                      <Link
                        to={`/student/events/${item.eventId}`}
                        className="student-btn student-btn--ghost"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="student-past-events-section">
          <div className="student-events-panel student-events-panel--past">
            <div className="student-panel-header">
              <div>
                <h2>Past Events</h2>
                <p>
                  Completed events based on full event date and time. Leave your
                  feedback here.
                </p>
              </div>
            </div>

            {pastMyEvents.length === 0 ? (
              <div className="student-empty-box">
                No past events available yet.
              </div>
            ) : (
              <div className="student-events-list">
                {pastMyEvents.map((item) => {
                  const alreadySubmitted = feedbackSubmittedIds.some(
                    (id) => String(id) === String(item.eventId)
                  );

                  return (
                    <div className="student-event-card" key={item.eventId}>
                      <div className="student-event-main">
                        <div className="student-event-top">
                          <span className="student-event-category">
                            {item.eventid}
                          </span>

                          <div className="student-badge-group">
                            <span className="student-badge student-badge--past">
                              Past Event
                            </span>

                            {item.status === "going" && (
                              <span className="student-badge student-badge--joined">
                                Going
                              </span>
                            )}

                            {item.status === "purchased" && (
                              <span className="student-badge student-badge--joined">
                                Purchased
                              </span>
                            )}
                          </div>
                        </div>

                        <h3>{item.title}</h3>

                        {item.description ? (
                          <p className="student-event-desc">{item.description}</p>
                        ) : null}

                        <div className="student-event-meta">
                          <span>📅 {formatDate(item.date)}</span>
                          <span>⏰ {formatTime(item.date)}</span>
                          <span>📍 {item.location}</span>
                        </div>

                        {item.ispaid && (
                          <div className="student-ticket-price">
                            Ticket Price: Rs. {item.price || 0}
                          </div>
                        )}
                      </div>

                      <div className="student-event-actions student-event-actions--stack">
                        <Link
                          to={`/student/events/${item.eventId}`}
                          className="student-btn student-btn--ghost"
                        >
                          View Details
                        </Link>

                        {!alreadySubmitted && (
                          <Link
                            to={`/student/feedback/${item.eventId}`}
                            className="student-btn student-btn--primary"
                          >
                            Leave Feedback
                          </Link>
                        )}

                        {alreadySubmitted && (
                          <>
                            <Link
                              to={`/student/feedback/${item.eventId}`}
                              className="student-btn student-btn--primary"
                            >
                              View Feedback
                            </Link>

                            <span className="student-feedback-done">
                              Feedback Submitted
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}