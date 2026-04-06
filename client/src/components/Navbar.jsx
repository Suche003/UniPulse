import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import { isLoggedIn, getRole, logout } from "../auth/auth";
import { apiRequest } from "../api/api";
import Notifications from './Notifications';

export default function Navbar() {
  const navigate = useNavigate();
  const logged = isLoggedIn();
  const role = getRole();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (logged) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [logged]);

  const fetchUnreadCount = async () => {
    try {
      const data = await apiRequest('/api/notifications');
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err) {}
  };

  const dashboardPath =
    role === "student"
      ? "/student/dashboard"
      : role === "club"
      ? "/club/dashboard"
      : role === "superadmin"
      ? "/superadmin/control-panel"
      : role === "sponsor"
      ? "/sponsor/dashboard"
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
      : role === "sponsor"
      ? "Sponsor"
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
              <Link className="btn btn--ghost" to="/signup">
                Student Signup
              </Link>
              <Link className="btn btn--primary" to="/sponsor-signup">
                Become a Sponsor
              </Link>
            </>
          ) : (
            <>
              <span className="roleBadge">{roleLabel}</span>

              {/* Notification bell */}
              <button
                className="btn btn--ghost"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ position: 'relative' }}
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {/* Super Admin extra options */}
              {role === "superadmin" && (
                <Link className="btn btn--ghost" to="/sponsors">
                  📦 Sponsors
                </Link>
              )}

              {/* Club options */}
              {role === "club" && (
                <>
                  <Link className="btn btn--ghost" to="/club/marketplace">
                    🛒 Marketplace
                  </Link>
                  <Link className="btn btn--ghost" to="/club/requests">
                    📝 My Requests
                  </Link>
                  <Link className="btn btn--ghost" to="/club/payments">
                    💰 Payments Received
                  </Link>
                </>
              )}

              {/* Sponsor options */}
              {role === "sponsor" && (
                <Link className="btn btn--ghost" to="/sponsor/dashboard">
                  📊 Dashboard
                </Link>
              )}

              {/* Dashboard for others (fallback) */}
              {role !== "sponsor" && role !== "club" && (
                <Link className="btn btn--ghost" to={dashboardPath}>
                  Dashboard
                </Link>
              )}

              <button className="btn btn--primary" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
      {showNotifications && <Notifications onClose={() => setShowNotifications(false)} />}
    </header>
  );
}