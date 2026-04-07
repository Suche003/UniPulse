import React from 'react';
import { Link } from 'react-router-dom';

const ClubDashboard = () => {
  return (
    <div className="club-dashboard">
      <div className="club-info">
        <h2>Club Dashboard</h2>
        <p>Welcome to your club dashboard. Manage your events and sponsorship requests here.</p>
      </div>
      <div className="dashboard-sections">
        <div className="section">
          <h3>📋 My Requests</h3>
          <p>View and manage your sponsorship requests.</p>
          <Link to="/club/requests" className="btn-sm">View Requests</Link>
        </div>
        <div className="section">
          <h3>🛒 Sponsorship Marketplace</h3>
          <p>Find sponsors and send proposals.</p>
          <Link to="/club/marketplace" className="btn-sm">Browse Marketplace</Link>
        </div>
        <div className="section">
          <h3>💰 Payments Received</h3>
          <p>View all sponsorship payments made to your club.</p>
          <Link to="/club/payments" className="btn-sm">View Payments</Link>
        </div>
      </div>
    </div>
  );
};

export default ClubDashboard;