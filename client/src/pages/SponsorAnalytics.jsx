import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import './SponsorAnalytics.css';

const SponsorAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiRequest('/api/analytics/sponsor');
        setStats(data);
      } catch (err) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner size="md" />;

  return (
    <div className="analytics-container">
      <h2>Sponsor Analytics</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalRequests}</div>
          <div className="stat-label">Total Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.acceptedRequests}</div>
          <div className="stat-label">Accepted</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.acceptanceRate}%</div>
          <div className="stat-label">Acceptance Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${stats.totalPaid}</div>
          <div className="stat-label">Total Paid</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendingRequests}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.declinedRequests}</div>
          <div className="stat-label">Declined</div>
        </div>
      </div>
    </div>
  );
};

export default SponsorAnalytics;