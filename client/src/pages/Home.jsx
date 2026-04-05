import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="page">
      

      <main className="container">
        <section className="hero">
          <div className="hero__left">
            <h1 className="hero__title">
              Discover and manage university events with <span>UniPulse</span>
            </h1>

            <p className="hero__subtitle">
              Stay updated with club activities, society meetups, workshops, and
              campus events — all in one place.
            </p>

            <div className="hero__actions">
              <Link className="btn btn--primary" to="/login">
                Student Login
              </Link>
              <Link className="btn btn--ghost" to="/signup">
                Create Account
              </Link>
            </div>

            <p className="hero__hint">
              Admins and clubs will have a separate portal.
            </p>
          </div>

          <div className="hero__right">
            <div className="card">
              <h3>What you can do</h3>
              <ul>
                <li>Browse upcoming campus events</li>
                <li>Register and get reminders</li>
                <li>Follow clubs & societies</li>
                <li>See event details instantly</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="features">
          <h2 className="sectionTitle">Built for students and clubs</h2>

          <div className="grid">
            <div className="feature">
              <h3>Fast discovery</h3>
              <p>Find events by club, date, or category.</p>
            </div>
            <div className="feature">
              <h3>Easy registration</h3>
              <p>Join events with one click and track your schedule.</p>
            </div>
            <div className="feature">
              <h3>Club management</h3>
              <p>Admins can add clubs and authorize event creation.</p>
            </div>
          </div>
        </section>

        <footer className="footer">
          <p>© {new Date().getFullYear()} UniPulse • University Event Management System</p>
        </footer>
      </main>
    </div>
  );
}