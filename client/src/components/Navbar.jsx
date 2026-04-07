import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/Logo.png";
import { isLoggedIn, getRole, logout } from "../auth/auth";
import { apiRequest } from "../api/api";
import Notifications from "./Notifications";

export default function Navbar({ superAdminMinimal = false }) {
  const navigate = useNavigate();
  const location = useLocation();

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
      const data = await apiRequest("/api/notifications");
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const storedUser = localStorage.getItem("unipulse_user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userName = user?.name || "";

  const pathname = location.pathname;

  const dashboardPath =
    role === "student"
      ? "/student/dashboard"
      : role === "club"
      ? "/club/dashboard"
      : role === "superadmin"
      ? "/superadmin/control-panel"
      : role === "sponsor"
      ? "/sponsor/dashboard"
      : role === "vendor"
      ? "/vendor/dashboard"
      : "/";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";
  const isSponsorSignupPage = pathname === "/sponsor-signup";
  const isVendorRegisterPage = pathname === "/register";

  const renderPublicNav = () => {
    if (isHomePage) {
      return (
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
          <Link className="btn btn--primary" to="/register">
            Register Vendor
          </Link>
        </>
      );
    }

    if (isLoginPage) {
      return (
        <>
          <Link className="btn btn--ghost" to="/">
            Home
          </Link>
          <Link className="btn btn--ghost" to="/signup">
            Student Signup
          </Link>
          <Link className="btn btn--primary" to="/sponsor-signup">
            Become a Sponsor
          </Link>
          <Link className="btn btn--primary" to="/register">
            Register Vendor
          </Link>
        </>
      );
    }

    if (isSignupPage) {
      return (
        <>
          <Link className="btn btn--ghost" to="/">
            Home
          </Link>
          <Link className="btn btn--ghost" to="/login">
            Login
          </Link>
          <Link className="btn btn--primary" to="/sponsor-signup">
            Become a Sponsor
          </Link>
          <Link className="btn btn--primary" to="/register">
            Register Vendor
          </Link>
        </>
      );
    }

    if (isSponsorSignupPage) {
      return (
        <>
          <Link className="btn btn--ghost" to="/">
            Home
          </Link>
          <Link className="btn btn--ghost" to="/login">
            Login
          </Link>
          <Link className="btn btn--ghost" to="/signup">
            Student Signup
          </Link>
          <Link className="btn btn--primary" to="/register">
            Register Vendor
          </Link>
        </>
      );
    }

    if (isVendorRegisterPage) {
      return (
        <>
          <Link className="btn btn--ghost" to="/">
            Home
          </Link>
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
      );
    }

    return (
      <>
        <Link className="btn btn--ghost" to="/">
          Home
        </Link>
        <Link className="btn btn--ghost" to="/login">
          Login
        </Link>
      </>
    );
  };

  const renderLoggedInNav = () => {
    if (superAdminMinimal && role === "superadmin") {
      return (
        <>
          <button className="btn btn--primary" onClick={handleLogout}>
            Logout
          </button>
        </>
      );
    }

    return (
      <>
        <button
          className="btn btn--ghost"
          onClick={() => setShowNotifications(!showNotifications)}
          style={{ position: "relative" }}
        >
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        {role !== "sponsor" && role !== "club" && role !== "superadmin" && (
          <Link className="btn btn--ghost" to={dashboardPath}>
            Dashboard
          </Link>
        )}

        {role === "student" && (
          <>
            <Link className="btn btn--ghost" to="/student/dashboard">
              Dashboard
            </Link>
            <Link className="btn btn--ghost" to="/student/profile">
              My Profile
            </Link>
          </>
        )}

        {role === "club" && (
          <>
            <Link className="btn btn--ghost" to="/club/dashboard">
              Dashboard
            </Link>
            <Link className="btn btn--ghost" to="/club/marketplace">
              Marketplace
            </Link>
            <Link className="btn btn--ghost" to="/club/requests">
              My Requests
            </Link>
            <Link className="btn btn--ghost" to="/club/payments">
              Payments
            </Link>
          </>
        )}

        {role === "sponsor" && (
          <>
            <Link className="btn btn--ghost" to="/sponsor/dashboard">
              Dashboard
            </Link>
          </>
        )}

        {role === "vendor" && (
          <>
            <Link className="btn btn--ghost" to="/vendor/dashboard">
              Dashboard
            </Link>
            <Link className="btn btn--ghost" to="/vendor-profile">
              My Profile
            </Link>
            <Link className="btn btn--ghost" to="/vendor-stalls">
              My Stalls
            </Link>
          </>
        )}

        {role === "superadmin" && (
          <>
            <Link className="btn btn--ghost" to="/superadmin/control-panel">
              Dashboard
            </Link>
            <Link className="btn btn--ghost" to="/sponsors">
              Sponsors
            </Link>
            <Link className="btn btn--ghost" to="/superadmin/vendors">
              Vendors
            </Link>
          </>
        )}

        <button className="btn btn--primary" onClick={handleLogout}>
          Logout
        </button>
      </>
    );
  };

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to={logged ? dashboardPath : "/"} className="brand">
          <img className="brand__logo" src={logo} alt="UniPulse logo" />
        </Link>

        <div className="nav__actions">
          {!logged ? renderPublicNav() : renderLoggedInNav()}
        </div>
      </div>

      {showNotifications && !superAdminMinimal && (
        <Notifications onClose={() => setShowNotifications(false)} />
      )}
    </header>
  );
}