import { Link } from "react-router-dom";
import logo from "../assets/Logo.png";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-page">
      <main className="home-container">
        <section className="home-hero">
          <div className="home-hero__content">
            <div className="home-hero__logo">
              <img src={logo} alt="UniPulse Logo" />
            </div>

            <h1 className="home-hero__title">
              One platform for <span>Students, Sponsors, Vendors</span> and
              university <span>Event Organizers</span>
            </h1>

            <div className="home-hero__actions">
              <Link className="home-btn home-btn--primary" to="/login">
                Get Started
              </Link>
            </div>
          </div>
        </section>

        <hr className="hrc" />

        <section className="home-section">
          <div className="home-grid home-grid--three">
            <div className="home-card">
              <h3>Become a Sponsor</h3>

              <p>
                Connect with university events, explore sponsorship
                opportunities that match your brand.
              </p>

              <Link
                className="home-btn home-btn--primary"
                to="/sponsor-signup"
              >
                Become a Sponsor
              </Link>
            </div>

            <div className="home-card">
              <h3>Register As a Vendor</h3>

              <p>
                Showcase your products or services, and receive stall-related
                opportunities from event organizers.
              </p>

              <Link
                className="home-btn home-btn--primary"
                to="/register"
              >
                Register Vendor
              </Link>
            </div>

            <div className="home-card">
              <h3>Student Sign Up</h3>

              <p>
                Discover upcoming events, register easily, track your
                participation, and stay connected with events.
              </p>

              <Link className="home-btn home-btn--primary" to="/signup">
                Student Sign Up
              </Link>
            </div>
          </div>
        </section>

        <section className="home-section">
          <h2 className="home-section__title">Why use UniPulse?</h2>

          <div className="home-grid home-grid--three">
            <div className="home-card home-feature">
              <div className="home-feature__icon">📅</div>

              <h3>Easy Event Discovery</h3>

              <p>
                Find campus events quickly by category, date, organizer, or
                interest.
              </p>
            </div>

            <div className="home-card home-feature">
              <div className="home-feature__icon">🤝</div>

              <h3>Better Collaboration</h3>

              <p>
                Bring students, clubs, sponsors, and vendors together in one
                connected system.
              </p>
            </div>

            <div className="home-card home-feature">
              <div className="home-feature__icon">⚡</div>

              <h3>Simple Participation</h3>

              <p>
                Register, manage involvement, and keep track of event-related
                activities with ease.
              </p>
            </div>
          </div>
        </section>

        <footer className="home-footer">
          <p>
            © {new Date().getFullYear()} UniPulse • University Event Management
            System
          </p>
        </footer>
      </main>
    </div>
  );
}