import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const events = [
  {
    id: "1",
    title: "Hackathon 2026",
    club: "IEEE Student Branch",
    date: "28 March 2026",
    time: "9:00 AM",
    venue: "Main Auditorium",
    isFree: true,
    category: "Technology",
    description:
      "Hackathon 2026 is a full-day innovation challenge where students collaborate, build ideas, and present solutions to real-world problems. It is a great opportunity to improve teamwork, coding, and presentation skills.",
    organizer: "IEEE Student Branch",
    contact: "ieee@sliit.lk",
    dressCode: "Casual / Smart Casual",
  },
  {
    id: "2",
    title: "Music Night",
    club: "Music Club",
    date: "30 March 2026",
    time: "6:00 PM",
    venue: "Open Air Theater",
    isFree: false,
    price: 1500,
    category: "Entertainment",
    description:
      "Music Night brings students together for a memorable evening with live performances, band sessions, and special acts. This is a ticketed event with limited seats.",
    organizer: "Music Club",
    contact: "musicclub@sliit.lk",
    dressCode: "Casual",
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
    description:
      "Career Fair connects students with companies, recruiters, and internship opportunities. Students can network, hand over CVs, and learn about current industry expectations.",
    organizer: "Career Guidance Unit",
    contact: "careers@sliit.lk",
    dressCode: "Formal / Office Wear",
  },
  {
    id: "4",
    title: "DJ Night 2026",
    club: "Entertainment Society",
    date: "08 April 2026",
    time: "7:00 PM",
    venue: "Open Grounds",
    isFree: false,
    price: 2000,
    category: "Entertainment",
    description:
      "DJ Night 2026 is a high-energy student party event with music, live performances, and a vibrant night atmosphere. Tickets are required for entry.",
    organizer: "Entertainment Society",
    contact: "entertainment@sliit.lk",
    dressCode: "Casual / Party Wear",
  },
];

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);

  const storedUser = localStorage.getItem("unipulse_user");
  const student = storedUser ? JSON.parse(storedUser) : null;
  const studentId = student?.id || "guest";

  const goingKey = `unipulse_going_events_${studentId}`;
  const paymentKey = `unipulse_payments_${studentId}`;

  const event = useMemo(() => {
    return events.find((item) => item.id === id);
  }, [id]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(goingKey) || "[]");
    setJoined(stored.some((item) => item.id === id));
  }, [id, goingKey]);

  function handleJoin() {
    if (!event) return;

    const stored = JSON.parse(localStorage.getItem(goingKey) || "[]");
    const alreadyExists = stored.some((item) => item.id === event.id);

    if (!alreadyExists) {
      const updated = [
        ...stored,
        {
          id: event.id,
          title: event.title,
          date: event.date,
          time: event.time,
          venue: event.venue,
          club: event.club,
          category: event.category,
        },
      ];

      localStorage.setItem(goingKey, JSON.stringify(updated));
    }

    setJoined(true);

    // return to dashboard so the student can immediately see the update
    setTimeout(() => {
      navigate("/student/dashboard");
    }, 500);
  }

  function handleRemove() {
    if (!event) return;

    const stored = JSON.parse(localStorage.getItem(goingKey) || "[]");
    const updated = stored.filter((item) => item.id !== event.id);

    localStorage.setItem(goingKey, JSON.stringify(updated));
    setJoined(false);
  }

  const payments = JSON.parse(localStorage.getItem(paymentKey) || "[]");
  const paymentSubmitted = payments.some((item) => item.eventId === id);

  if (!event) {
    return (
      <div className="page">
        <Navbar />
        <main className="container">
          <section className="eventDetailsCard">
            <h1>Event Not Found</h1>
            <p className="eventMuted">
              The event you are trying to view does not exist.
            </p>
            <Link to="/student/dashboard" className="btn btn--ghost">
              Back to Dashboard
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />

      <main className="container">
        <section className="eventHero">
          <div className="eventHero__content">
            <div className="eventHero__top">
              <span className="eventCategory">{event.category}</span>
              <span className={event.isFree ? "freeBadge" : "paidBadge"}>
                {event.isFree ? "Free Event" : `Paid Event • Rs. ${event.price}`}
              </span>
            </div>

            <h1 className="eventHero__title">{event.title}</h1>
            <p className="eventHero__club">Organized by {event.club}</p>

            <div className="eventHero__meta">
              <span>📅 {event.date}</span>
              <span>⏰ {event.time}</span>
              <span>📍 {event.venue}</span>
            </div>
          </div>
        </section>

        <section className="eventDetailsGrid">
          <div className="eventDetailsCard">
            <h2>About This Event</h2>
            <p className="eventDescription">{event.description}</p>

            <div className="eventActionBox">
              {event.isFree ? (
                <>
                  {!joined ? (
                    <button className="btn btn--primary" onClick={handleJoin}>
                      I Am Going
                    </button>
                  ) : (
                    <div className="eventActionButtons">
                      <button className="btn btn--primary" disabled>
                        You're Going ✅
                      </button>

                      <button className="btn btn--danger" onClick={handleRemove}>
                        Remove from Going
                      </button>
                    </div>
                  )}

                  {joined && (
                    <p className="successText">
                      You have successfully joined this event.
                    </p>
                  )}
                </>
              ) : (
                <>
                  {!paymentSubmitted ? (
                    <Link
                      to={`/student/payment/${event.id}`}
                      className="btn btn--primary"
                    >
                      Buy Ticket
                    </Link>
                  ) : (
                    <button className="btn btn--primary" disabled>
                      Payment Submitted ✅
                    </button>
                  )}

                  <p className="eventMuted">
                    {paymentSubmitted
                      ? "Your payment request has already been submitted."
                      : "Ticket purchase flow can be connected next."}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="eventDetailsCard">
            <h2>Event Information</h2>

            <div className="infoList">
              <div className="infoRow">
                <span>Date</span>
                <strong>{event.date}</strong>
              </div>

              <div className="infoRow">
                <span>Time</span>
                <strong>{event.time}</strong>
              </div>

              <div className="infoRow">
                <span>Venue</span>
                <strong>{event.venue}</strong>
              </div>

              <div className="infoRow">
                <span>Organizer</span>
                <strong>{event.organizer}</strong>
              </div>

              <div className="infoRow">
                <span>Contact</span>
                <strong>{event.contact}</strong>
              </div>

              <div className="infoRow">
                <span>Dress Code</span>
                <strong>{event.dressCode}</strong>
              </div>
            </div>

            <div className="eventDetailsButtons">
              <Link to="/student/dashboard" className="btn btn--ghost">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}