import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const upcomingEvents = [
  {
    id: "1",
    title: "Hackathon 2026",
    club: "IEEE Student Branch",
    date: "28 March 2026",
    time: "9:00 AM",
    venue: "Main Auditorium",
    isFree: true,
    category: "Technology",
  },
  {
    id: "2",
    title: "Music Night",
    club: "Music Club",
    date: "30 March 2026",
    time: "6:00 PM",
    venue: "Open Air Theater",
    isFree: false,
    category: "Entertainment",
  },
  {
    id: "3",
    title: "Career Fair",
    club: "Career Guidance Unit",
    date: "02 April 2026",
    time: "10:00 AM",
    venue: "Faculty Lobby",
    isFree: true,
    category: "Career",
  },
  {
    id: "4",
    title: "DJ Night 2026",
    club: "Entertainment Society",
    date: "08 April 2026",
    time: "7:00 PM",
    venue: "Open Grounds",
    isFree: false,
    category: "Entertainment",
  },
];

export default function StudentDashboard() {
  const storedUser = localStorage.getItem("unipulse_user");
  const student = storedUser ? JSON.parse(storedUser) : null;

  const studentName = student?.name || "Student";
  const studentRegNo = student?.regNo || "N/A";
  const studentId = student?.id || "guest";

  const goingEvents = JSON.parse(
    localStorage.getItem(`unipulse_going_events_${studentId}`) || "[]"
  );

  const payments = JSON.parse(
    localStorage.getItem(`unipulse_payments_${studentId}`) || "[]"
  );

  const approvedPayments = payments.filter((p) => p.status === "Approved");
  const pendingPayments = payments.filter(
    (p) => p.status === "Pending" || p.status === "Rejected"
  );

  function getEventTitle(eventId) {
    const found = upcomingEvents.find((e) => e.id === eventId);
    return found?.title || `Event #${eventId}`;
  }

  return (
    <div className="page">
      <Navbar />

      <main className="container">
        <section className="dashboardHero upgradedHero">
          <div className="heroTextBlock">
            <p className="dashboardTag">Student Dashboard</p>
            <h1 className="dashboardTitle">Welcome back, {studentName}</h1>
            <p className="dashboardSubtitle">
              Manage your personal event participation, ticket requests, and
              profile details from one place.
            </p>

            <div className="heroButtons">
              <Link to="/student/profile" className="btn btn--primary">
                My Profile
              </Link>
            </div>
          </div>

          <div className="dashboardHighlightCard">
            <h3>Your Student Info</h3>
            <div className="profileInfo compactInfo">
              <div className="profileRow">
                <span>Registration No</span>
                <strong>{studentRegNo}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboardGrid upgradedGrid">
          <div className="dashboardPanel bigPanel">
            <div className="panelHeader">
              <h2>Upcoming Events</h2>
              <p className="panelSubtext">
                Explore the latest events happening around campus.
              </p>
            </div>

            <div className="eventList bigEventList">
              {upcomingEvents.map((event) => (
                <div className="eventCard largeEventCard" key={event.id}>
                  <div className="eventMain">
                    <div className="eventTopRow">
                      <span className="eventCategory">{event.category}</span>
                      <span className={event.isFree ? "freeBadge" : "paidBadge"}>
                        {event.isFree ? "Free Event" : "Paid Event"}
                      </span>
                    </div>

                    <h3>{event.title}</h3>
                    <p className="eventClub">{event.club}</p>

                    <div className="eventMeta">
                      <span>📅 {event.date}</span>
                      <span>⏰ {event.time}</span>
                      <span>📍 {event.venue}</span>
                    </div>
                  </div>

                  <div className="eventCardActions">
                    <Link
                      to={`/student/events/${event.id}`}
                      className="btn btn--ghost"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboardSide">
            <div className="dashboardPanel">
              <div className="panelHeader">
                <h2>My Going Events</h2>
              </div>

              {goingEvents.length === 0 && approvedPayments.length === 0 ? (
                <p className="emptyText">No events joined yet.</p>
              ) : (
                <div className="miniList">
                  {goingEvents.map((event) => (
                    <div className="miniCard" key={event.id}>
                      <h4>{event.title}</h4>
                      <p>{event.date}</p>
                      <span className="statusFree">Free</span>
                    </div>
                  ))}

                  {approvedPayments.map((pay) => (
                    <div className="miniCard" key={pay.id}>
                      <h4>{getEventTitle(pay.eventId)}</h4>
                      <p>{formatDate(pay.date)}</p>
                      <span className="statusPaid">Paid</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboardPanel">
              <div className="panelHeader">
                <h2>My Payment Requests</h2>
              </div>

              {pendingPayments.length === 0 ? (
                <p className="emptyText">No pending requests.</p>
              ) : (
                <div className="miniList">
                  {pendingPayments.map((pay) => (
                    <div className="miniCard" key={pay.id}>
                      <h4>{getEventTitle(pay.eventId)}</h4>
                      <p>{formatDate(pay.date)}</p>
                      <span
                        className={
                          pay.status === "Pending"
                            ? "statusPending"
                            : "statusRejected"
                        }
                      >
                        {pay.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}