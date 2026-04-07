import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();

    if (!identifier.trim() || !password) {
      alert("Please enter identifier and password");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("unipulse_token", data.token);
      localStorage.setItem("unipulse_role", data.role);
      localStorage.setItem("unipulse_user", JSON.stringify(data.user));

      navigate(data.redirectTo);
    } catch (err) {
      alert("Server error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__bg"></div>
      <div className="login-page__orb login-page__orb--one"></div>
      <div className="login-page__orb login-page__orb--two"></div>
      <div className="login-page__orb login-page__orb--three"></div>

      <div className="login-page__topbar">
        <Link to="/" className="login-home-btn">
          <span>&#8617;</span> Go Back
        </Link>
      </div>

      <main className="login-layout">
        <section className="login-info">
          <h1 className="login-info__title">
            Welcome back to <span>UniPulse</span>
          </h1>

        </section>

        <section className="login-form-card">
          <div className="login-form-card__header">
            <h2>Login</h2>
          </div>

          <form className="login-form" onSubmit={onSubmit} noValidate>
            <div className="login-field">
              <label>Username</label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter username or email"
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>

            <button className="login-submit-btn" disabled={submitting}>
              {submitting ? "Logging in..." : "Login"}
            </button>

            <p className="login-footer">
              New to UniPulse? <Link to="/signup">Create an account</Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}