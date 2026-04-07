import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { logout } from "../auth/auth";
import "./ClubDashboard.css";

const ClubDashboard = () => {
  const [approvedUpcomingEvents, setApprovedUpcomingEvents] = useState([]);
  const [pendingEventRequests, setPendingEventRequests] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("unipulse_user")) || {};
  const clubName = user?.clubName || user?.name || "Club";
  const loggedInClubId = user?._id || user?.id || user?.clubid || "";

  useEffect(() => {
    fetchClubDashboardData();
  }, []);

  const fetchClubDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!loggedInClubId) {
        setError("Club ID not found. Please login again.");
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `http://localhost:5000/api/events/club/${loggedInClubId}`
      );

      const myEvents = Array.isArray(res.data) ? res.data : [];
      const now = new Date();

      const approvedUpcoming = myEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return event.status === "approved" && eventDate >= now;
      });

      const pendingRequests = myEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return event.status === "pending" && eventDate >= now;
      });

      const completedPast = myEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return event.status === "approved" && eventDate < now;
      });

      setApprovedUpcomingEvents(approvedUpcoming);
      setPendingEventRequests(pendingRequests);
      setPastEvents(completedPast);
    } catch (err) {
      console.error("Error fetching club dashboard data:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "No date available";

    const d = new Date(dateValue);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStudentCount = () => {
    return 0;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="club-dashboard-page">
      <div className="club-dashboard-container">
        {/* NAVBAR */}
        <header className="club-dashboard-navbar">
          <div className="club-dashboard-navbar__left">
            <div className="club-dashboard-navbar__brand-dot"></div>
            <div>
              <h2>UniPulse</h2>
              <span>Club Dashboard</span>
            </div>
          </div>

          <div className="club-dashboard-navbar__right">
            <Link to="/club/profile" className="club-nav-btn club-nav-btn--profile">
              Profile
            </Link>
            <button
              type="button"
              className="club-nav-btn club-nav-btn--logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {/* HERO */}
        <section className="club-dashboard-hero">
          <div className="club-dashboard-hero__content">
            <h1>Welcome Back {clubName}!</h1>
          </div>
          <div className="club-dashboard-hero__glow"></div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="club-top-actions-section">
          <div className="club-section-header">
            <h2>Quick Actions</h2>
          </div>

          <div className="club-top-actions-grid">
            <Link to="/club/clubrequest" className="club-create-event-card">
              <div className="club-create-event-card__icon">➕</div>
              <div>
                <h3>Create Event</h3>
              </div>
            </Link>

            <div className="club-mini-stat-card">
              <span className="club-mini-stat-card__label">Upcoming Approved</span>
              <strong>{approvedUpcomingEvents.length}</strong>
            </div>

            <div className="club-mini-stat-card">
              <span className="club-mini-stat-card__label">Pending Requests</span>
              <strong>{pendingEventRequests.length}</strong>
            </div>

            <div className="club-mini-stat-card">
              <span className="club-mini-stat-card__label">Past Events</span>
              <strong>{pastEvents.length}</strong>
            </div>
          </div>
        </section>

        {loading && (
          <div className="club-info-message">Loading dashboard data...</div>
        )}

        {error && !loading && (
          <div className="club-error-message">{error}</div>
        )}

        {!loading && !error && (
          <>
            <section className="club-dashboard-section">
              <div className="club-section-header">
                <h2>Upcoming Events</h2>
              </div>

              {approvedUpcomingEvents.length === 0 ? (
                <div className="club-empty-card">
                  No approved upcoming events found.
                </div>
              ) : (
                <div className="club-event-grid">
                  {approvedUpcomingEvents.map((event) => (
                    <div className="club-event-card" key={event._id}>
                      <div className="club-event-card__top">
                        <span className="club-event-badge approved">Approved</span>
                        <h3>{event.title || "Untitled Event"}</h3>
                      </div>

                      <div className="club-event-meta">
                        <p>
                          <span>Event ID:</span> {event.eventid}
                        </p>
                        <p>
                          <span>Date:</span> {formatDate(event.date)}
                        </p>
                        <p>
                          <span>Location:</span> {event.location || "Not specified"}
                        </p>
                        <p>
                          <span>Students Coming:</span> {getStudentCount()}
                        </p>
                      </div>

                      <div className="club-event-card__actions">
                        <Link
                          to={`/events/${event._id}`}
                          className="club-action-btn"
                        >
                          View Event
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="club-dashboard-section">
              <div className="club-section-header">
                <h2>Upcoming Event Requests</h2>
              </div>

              {pendingEventRequests.length === 0 ? (
                <div className="club-empty-card">
                  No upcoming event requests found.
                </div>
              ) : (
                <div className="club-event-grid">
                  {pendingEventRequests.map((event) => (
                    <div className="club-event-card" key={event._id}>
                      <div className="club-event-card__top">
                        <span className="club-event-badge pending">Pending</span>
                        <h3>{event.title || "Untitled Event"}</h3>
                      </div>

                      <div className="club-event-meta">
                        <p>
                          <span>Event ID:</span> {event.eventid}
                        </p>
                        <p>
                          <span>Date:</span> {formatDate(event.date)}
                        </p>
                        <p>
                          <span>Location:</span> {event.location || "Not specified"}
                        </p>
                        <p>
                          <span>Status:</span> {event.status}
                        </p>
                      </div>

                      <div className="club-event-card__actions">
                        <Link
                          to={`/events/${event._id}`}
                          className="club-action-btn secondary"
                        >
                          View Request
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="club-dashboard-section">
              <div className="club-section-header">
                <h2>Past Events</h2>
              </div>

              {pastEvents.length === 0 ? (
                <div className="club-empty-card">No past events found.</div>
              ) : (
                <div className="club-event-grid">
                  {pastEvents.map((event) => (
                    <div className="club-event-card" key={event._id}>
                      <div className="club-event-card__top">
                        <span className="club-event-badge past">Past Event</span>
                        <h3>{event.title || "Untitled Event"}</h3>
                      </div>

                      <div className="club-event-meta">
                        <p>
                          <span>Event ID:</span> {event.eventid}
                        </p>
                        <p>
                          <span>Date:</span> {formatDate(event.date)}
                        </p>
                        <p>
                          <span>Location:</span> {event.location || "Not specified"}
                        </p>
                      </div>

                      <div className="club-event-card__actions">
                        <button type="button" className="club-action-btn">
                          Generate Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="club-dashboard-section">
              <div className="club-section-header">
                <h2>Sponsorship Management</h2>
              </div>

              <div className="club-sponsorship-grid">
                <div className="club-sponsorship-card">
                  <div className="club-sponsorship-card__icon">📋</div>
                  <h3>My Requests</h3>
                  <p>
                    View and manage sponsorship requests submitted by your club.
                  </p>
                  <Link to="/club/requests" className="club-action-btn">
                    View Requests
                  </Link>
                </div>

                <div className="club-sponsorship-card">
                  <div className="club-sponsorship-card__icon">🛒</div>
                  <h3>Sponsorship Marketplace</h3>
                  <p>
                    Explore sponsor opportunities and send proposals.
                  </p>
                  <Link to="/club/marketplace" className="club-action-btn">
                    Browse Marketplace
                  </Link>
                </div>

                <div className="club-sponsorship-card">
                  <div className="club-sponsorship-card__icon">💰</div>
                  <h3>Payments Received</h3>
                  <p>
                    Review sponsorship payments received by your club.
                  </p>
                  <Link to="/club/payments" className="club-action-btn">
                    View Payments
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default ClubDashboard;