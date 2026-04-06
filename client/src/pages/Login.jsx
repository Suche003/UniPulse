import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

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

      // store auth (simple version)
      localStorage.setItem("unipulse_token", data.token);
      localStorage.setItem("unipulse_role", data.role);
      localStorage.setItem("unipulse_user", JSON.stringify(data.user));

      // redirect based on backend response
      navigate(data.redirectTo);
    } catch (err) {
      alert("Server error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
     
      <main className="container">
        <section className="authCard">
          <h1 className="authTitle">Login</h1>
          <p className="authSubtitle">
            Enter Your Credentials for Login
          </p>

          <form className="form" onSubmit={onSubmit} noValidate>
            <div className="field">
              <label>Username</label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter username"
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>

            <button className="btn btn--primary btn--full" disabled={submitting}>
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}