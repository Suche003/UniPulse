import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiRequest } from "../api/api";
import "./SuperAdminPanel.css";

export default function SuperAdminPanel() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiRequest("/api/admin/stats");
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoading(false);
    }
  };

  const mainCards = [
    {
      title: "Manage Event Organizers",
      actions: [
        { label: "Create Club or Society", path: "/superadmin/createclub" },
        { label: "View Clubs & Socities", path: "/superadmin/viewallclubs" },
      ],
    },
    {
      title: "Manage Events",
      actions: [
        { label: "All Events", path: "/superadmin/alleventsadmin" },
        { label: "Pending Events", path: "/superadmin/pendingevents" },
      ],
    },
    {
      title: "Manage Users",
      actions: [
        { label: "Vendors", path: "/superadmin/vendors" },
        { label: "Sponsors", path: "/superadmin/sponsors" },
        { label: "Students", path: "/superadmin/students" },
      ],
    },
  ];

  const quickActions = [
    {
      title: "Vendor Registration Requests",
      path: "/superadmin/vendor-requests",
    },
    {
      title: "Event Registration Requests",
      path: "/superadmin/pendingevents",
    },
    {
      title: "Sponsor Registration Requests",
      path: "/superadmin/sponsor-requests",
    },
  ];

  return (
    <div className="superadmin-page">
      <Navbar superAdminMinimal={true} />

      <main className="superadmin-container">
        <section className="superadmin-hero">
          <div className="superadmin-hero__content">
            <h1>Super Admin Control Panel</h1>
          </div>
        </section>

        <section className="superadmin-overview-section">
          <div className="superadmin-overview-grid">
            <div className="superadmin-side-quick-actions">
              <div className="superadmin-section-heading superadmin-section-heading--tight">
                <h2>Quick Actions</h2>
              </div>

              <div className="superadmin-side-quick-grid">
                {quickActions.map((card) => (
                  <button
                    key={card.title}
                    className="superadmin-action-card"
                    onClick={() => navigate(card.path)}
                    type="button"
                  >
                    <h3>{card.title}</h3>
                  </button>
                ))}
              </div>
            </div>

            <div className="superadmin-side-stats">
              <div className="superadmin-section-heading superadmin-section-heading--tight">
                <h2>Platform Overview</h2>
              </div>

              {loading ? (
                <div className="superadmin-loading-card">Loading stats...</div>
              ) : (
                <div className="superadmin-side-stats-grid">
                  <div className="superadmin-stat-card">
                    <span className="superadmin-stat-card__label">
                      Total Students
                    </span>
                    <h3>{stats?.students ?? 0}</h3>
                  </div>

                  <div className="superadmin-stat-card">
                    <span className="superadmin-stat-card__label">
                      Total Vendors
                    </span>
                    <h3>{stats?.vendors ?? 0}</h3>
                  </div>

                  <div className="superadmin-stat-card">
                    <span className="superadmin-stat-card__label">
                      Total Events
                    </span>
                    <h3>{stats?.events ?? 0}</h3>
                  </div>

                  <div className="superadmin-stat-card superadmin-stat-card--highlight">
                    <span className="superadmin-stat-card__label">
                      Total Sponsors
                    </span>
                    <h3>{stats?.sponsors ?? 0}</h3>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="superadmin-actions-section">
          <div className="superadmin-section-heading">
            <h2>Main Management</h2>
          </div>

          <div className="superadmin-main-grid">
            {mainCards.map((card) => (
              <div key={card.title} className="superadmin-main-card">
                <h3>{card.title}</h3>
                <div className="superadmin-main-card__actions">
                  {card.actions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      className="superadmin-mini-btn"
                      onClick={() => navigate(action.path)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}