import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { logout } from "../auth/auth";
import "./ClubDashboard.css";

const ClubDashboard = () => {
  const [approvedUpcomingEvents, setApprovedUpcomingEvents] = useState([]);
  const [pendingEventRequests, setPendingEventRequests] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]); // ✅ NEW
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("unipulse_user")) || {};
  const clubName = user?.clubName || user?.name || "Club";
  const loggedInClubId = user?._id || user?.id || user?.clubid || "";

  useEffect(() => {
    fetchClubDashboardData();
    fetchClubRating();
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

      // ✅ NEW (no change to existing logic)
      const rejected = myEvents.filter((event) => {
        return event.status === "rejected";
      });

      setApprovedUpcomingEvents(approvedUpcoming);
      setPendingEventRequests(pendingRequests);
      setPastEvents(completedPast);
      setRejectedEvents(rejected); // ✅ NEW

    } catch (err) {
      console.error("Error fetching club dashboard data:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClubRating = async () => {
    if (!loggedInClubId) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/ratings/average/${loggedInClubId}/Club`
      );
      setAvgRating(res.data.avgRating);
      setRatingCount(res.data.count);
    } catch (err) {
      console.error("Failed to fetch club rating:", err);
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

  const getStudentCount = () => 0;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ✅ NEW delete function
  const handleDelete = async (eventId) => {
    try {
      await axios.delete(`http://localhost:5000/api/events/${eventId}`);
      fetchClubDashboardData();
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const renderEventCard = (event, type = "approved") => {
    const eventId =
      event._id || event.id || Math.random().toString(36).substr(2, 9);
    const title = event.title || "Untitled Event";
    const date = formatDate(event.date);
    const location = event.location || "Not specified";
    const status = event.status || type;

    return (
      <div className="club-event-card" key={eventId}>
        <div className="club-event-card__top">
          <span className={`club-event-badge ${type}`}>{status}</span>
          <h3>{title}</h3>
        </div>

        <div className="club-event-meta">
          <p>
            <span>Event ID:</span> {event.eventid || "N/A"}
          </p>
          <p>
            <span>Date:</span> {date}
          </p>
          <p>
            <span>Location:</span> {location}
          </p>

          {type === "approved" && (
            <p>
              <span>Students Coming:</span> {getStudentCount()}
            </p>
          )}

          {type === "pending" && (
            <p>
              <span>Status:</span> {status}
            </p>
          )}
        </div>

        <div className="club-event-card__actions">
          {type === "pending" ? (
            <>
              <Link
                to={`/events/view/${eventId}`}
                className="club-action-btn secondary"
              >
                View Request
              </Link>
              <Link
                to={`/events/update/${eventId}`}
                className="club-action-btn secondary"
              >
                Update Event
              </Link>
            </>
          ) : type === "approved" ? (
            <Link
              to={`/events/view/${eventId}`}
              className="club-action-btn"
            >
              View Event
            </Link>
          ) : type === "rejected" ? ( // ✅ NEW
            <>
              <Link
                to={`/events/view/${eventId}`}
                className="club-action-btn secondary"
              >
                View Request
              </Link>
              <button
                type="button"
                className="club-action-btn danger"
                onClick={() => handleDelete(eventId)}
              >
                Delete
              </button>
              
    {event.rejectReason && (
      <p className="club-reject-reason" style={{ color: "red", fontWeight: "bold" }}>
        <span>Reason:</span> {event.rejectReason}
      </p>
    )}
            </>
          ) : (
            <button type="button" className="club-action-btn">
              Generate Report
            </button>
          )}
        </div>
      </div>
    );
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
            <Link
              to="/club/profile"
              className="club-nav-btn club-nav-btn--profile"
            >
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
            {avgRating > 0 && (
              <div className="club-rating-badge">
                ⭐ {avgRating.toFixed(1)} / 5 ({ratingCount} {ratingCount === 1 ? 'review' : 'reviews'} from sponsors)
              </div>
            )}
          </div>
          <div className="club-dashboard-hero__glow"></div>
        </section>

        {/* SEARCH BAR */}
<div className="club-search-container">
  <input
    type="text"
    placeholder="Search events (title / location / ID/Date)..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="club-search-input"
  />
</div>

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
              <span className="club-mini-stat-card__label">
                Upcoming Approved
              </span>
              <strong>{approvedUpcomingEvents.length}</strong>
            </div>

            <div className="club-mini-stat-card">
              <span className="club-mini-stat-card__label">
                Pending Requests
              </span>
              <strong>{pendingEventRequests.length}</strong>
            </div>

            <div className="club-mini-stat-card">
              <span className="club-mini-stat-card__label">
                Past Events
              </span>
              <strong>{pastEvents.length}</strong>
            </div>

            {/* Rating Stat Card */}
            <div className="club-mini-stat-card rating-stat">
              <span className="club-mini-stat-card__label">Sponsor Rating</span>
              <strong>
                {avgRating > 0 ? (
                  <>⭐ {avgRating.toFixed(1)}</>
                ) : (
                  <>—</>
                )}
              </strong>
              {ratingCount > 0 && (
                <small>({ratingCount} {ratingCount === 1 ? 'review' : 'reviews'})</small>
              )}
            </div>
          </div>
        </section>

        {loading && (
          <div className="club-info-message">
            Loading dashboard data...
          </div>
        )}
        {error && !loading && (
          <div className="club-error-message">{error}</div>
        )}

        {!loading && !error && (
          <>
            {/* APPROVED */}
            <section className="club-dashboard-section">
              <div className="club-section-header">
                <h2>Approved Events</h2>
              </div>
              {approvedUpcomingEvents.length === 0 ? (
                <div className="club-empty-card">
                  No approved upcoming events found.
                </div>
              ) : (
                <div className="club-event-grid">
                  {approvedUpcomingEvents
  .filter((event) =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
   (event.eventid && event.eventid.toString().toLowerCase().includes(searchTerm.toLowerCase()))||
   (event.date &&
  (
    new Date(event.date).toLocaleDateString("en-GB").toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(event.date).toISOString().toLowerCase().includes(searchTerm.toLowerCase())
  )
)
  )
  .map((event) =>
    renderEventCard(event, "approved")
  )}
                </div>
              )}
            </section>

            {/* PENDING */}
            <section className="club-dashboard-section">
              <div className="club-section-header">
                <h2>Pending Events </h2>
              </div>
              {pendingEventRequests.length === 0 ? (
                <div className="club-empty-card">
                  No upcoming event requests found.
                </div>
              ) : (
                <div className="club-event-grid">
                  {pendingEventRequests
  .filter((event) =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.eventid && event.eventid.toString().toLowerCase().includes(searchTerm.toLowerCase()))||
   (event.date &&
  (
    new Date(event.date).toLocaleDateString("en-GB").toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(event.date).toISOString().toLowerCase().includes(searchTerm.toLowerCase())
  )
)
  )
  .map((event) =>
    renderEventCard(event, "pending")
  )}
                </div>
              )}
            </section>

            {/* ✅ REJECTED NEW */}
            <section className="club-dashboard-section">
              <div className="club-section-header">
                <h2>Rejected Events</h2>
              </div>
              {rejectedEvents.length === 0 ? (
                <div className="club-empty-card">
                  No rejected events found.
                </div>
              ) : (
                <div className="club-event-grid">
                  {rejectedEvents
  .filter((event) =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.eventid && event.eventid.toString().toLowerCase().includes(searchTerm.toLowerCase()))||
    (event.date &&
  (
    new Date(event.date).toLocaleDateString("en-GB").toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(event.date).toISOString().toLowerCase().includes(searchTerm.toLowerCase())
  )
)
  )
  .map((event) =>
    renderEventCard(event, "rejected")
  )}
                </div>
              )}
            </section>

            {/* PAST */}
            <section className="club-dashboard-section">
              <div className="club-section-header">
                <h2>Past Events</h2>
              </div>
              {pastEvents.length === 0 ? (
                <div className="club-empty-card">
                  No past events found.
                </div>
              ) : (
                <div className="club-event-grid">
                  {pastEvents
  .filter((event) =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
   (event.eventid && event.eventid.toString().toLowerCase().includes(searchTerm.toLowerCase()))||
   (event.date &&
  (
    new Date(event.date).toLocaleDateString("en-GB").toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(event.date).toISOString().toLowerCase().includes(searchTerm.toLowerCase())
  )
)
  )
  .map((event) =>
    renderEventCard(event, "past")
  )}
                </div>
              )}
            </section>

            {/* SPONSORSHIP */}
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