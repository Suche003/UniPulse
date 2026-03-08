import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";

import { isLoggedIn, getRole, logout } from "../auth/auth";

export default function Navbar() {
  const navigate = useNavigate();

  const logged = isLoggedIn();
  const role = getRole();

  const dashboardPath =
    role === "student"
      ? "/student/dashboard"
      : role === "club"
      ? "/club/dashboard"
      : role === "superadmin"
      ? "/superadmin/control-panel"
      : "/";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const roleLabel =
    role === "student"
      ? "Student"
      : role === "club"
      ? "Club"
      : role === "superadmin"
      ? "Super Admin"
      : "";

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to="/" className="brand">
          <img className="brand__logo" src={logo} alt="UniPulse logo" />
        </Link>

        <div className="nav__actions">
          {!logged ? (
            <>
              <Link className="btn btn--ghost" to="/login">
                Login
              </Link>

              <Link className="btn btn--primary" to="/signup">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <span className="roleBadge">{roleLabel}</span>

              <Link className="btn btn--ghost" to={dashboardPath}>
                Dashboard
              </Link>

              <button className="btn btn--primary" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}