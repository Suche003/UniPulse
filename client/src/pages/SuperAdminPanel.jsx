
import { useState, useEffect } from 'react';
import { apiRequest } from '../api/api';
import './SuperAdminPanel.css'; // we'll create this

export default function SuperAdminPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiRequest('/api/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="superadmin-panel">
      <h2>Super Admin Control Panel</h2>
      {loading ? (
        <p>Loading stats...</p>
      ) : stats && (
        <div className="stats-grid">
          <div className="stat-card">Total Vendors: {stats.vendors}</div>
          <div className="stat-card">Total Sponsors: {stats.sponsors}</div>
          <div className="stat-card">Pending Vendors: {stats.pendingVendors}</div>
          <div className="stat-card">Pending Sponsors: {stats.pendingSponsors}</div>
          <div className="stat-card revenue">Total Revenue: ${stats.totalRevenue}</div>
        </div>
      )}

      <div className="admin-actions">
        <button className="btn-primary" onClick={() => window.location.href = "/superadmin/events"}>
          Create Event
        </button>
        <button className="btn-primary" onClick={() => window.location.href = "/superadmin/events-get"}>
          Show Event
        </button>
        <button className="btn-primary" onClick={() => window.location.href = "/admin/packages"}>
          Sponsorship Packages
        </button>
        <button className="btn-primary" onClick={() => window.location.href = "/admin/stall-requests"}>
          Stall Requests
        </button>
      </div>
    </div>
  );
}
