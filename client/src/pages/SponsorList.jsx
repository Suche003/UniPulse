import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiRequest } from '../api/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import './SponsorList.css';

const SponsorList = () => {
  const [sponsors, setSponsors] = useState([]);
  const [filteredSponsors, setFilteredSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // track which sponsor is performing action

  useEffect(() => {
    fetchSponsors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sponsors, statusFilter, levelFilter, searchTerm]);

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/api/sponsors');
      setSponsors(data);
      setError('');
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sponsors];
    if (statusFilter) filtered = filtered.filter(s => s.status === statusFilter);
    if (levelFilter) filtered = filtered.filter(s => s.level === levelFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(term) ||
        (s.description && s.description.toLowerCase().includes(term))
      );
    }
    setFilteredSponsors(filtered);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setLevelFilter('');
    setSearchTerm('');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete sponsor "${name}"? This action cannot be undone.`)) return;
    
    setActionLoading(id);
    try {
      await apiRequest(`/api/sponsors/${id}`, { method: 'DELETE' });
      setSponsors(sponsors.filter(s => s._id !== id));
      toast.success('Sponsor deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete sponsor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setActionLoading(id);
    try {
      await apiRequest(`/api/sponsors/${id}/status`, { method: 'PATCH', body: { status: newStatus } });
      await fetchSponsors();
      toast.success(`Sponsor ${newStatus} successfully`);
    } catch (err) {
      toast.error(err.message || `Failed to update status to ${newStatus}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePaymentUpdate = async (id) => {
    const paid = prompt('Enter amount paid:');
    if (paid === null) return;
    const amount = parseFloat(paid);
    if (isNaN(amount)) {
      toast.error('Invalid amount');
      return;
    }
    setActionLoading(id);
    try {
      await apiRequest(`/api/sponsors/${id}/payment`, { method: 'PATCH', body: { paymentStatus: 'paid', amountPaid: amount } });
      await fetchSponsors();
      toast.success(`Payment recorded: $${amount}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update payment');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner size="lg" message="Loading sponsors..." />;
  if (error) return (
    <div className="sponsor-container">
      <div className="error-message">Error: {error}</div>
      <button className="btn-primary" onClick={fetchSponsors}>Retry</button>
    </div>
  );

  return (
    <div className="sponsor-container">
      <div className="sponsor-header">
        <h2>📦 Sponsors</h2>
        <Link to="/sponsors/new" className="btn-primary">➕ Add Sponsor</Link>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
            <option value="">All Levels</option>
            <option value="Platinum">Platinum</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Bronze">Bronze</option>
            <option value="Other">Other</option>
          </select>
          <button className="btn-sm" onClick={clearFilters}>Clear Filters</button>
        </div>
      </div>

      {filteredSponsors.length === 0 ? (
        <EmptyState
          title="No sponsors found"
          message={searchTerm || statusFilter || levelFilter ? "Try adjusting your filters" : "Get started by adding your first sponsor"}
          actionText={searchTerm || statusFilter || levelFilter ? "Clear Filters" : "Add Sponsor"}
          onAction={searchTerm || statusFilter || levelFilter ? clearFilters : () => window.location.href = "/sponsors/new"}
        />
      ) : (
        <div className="sponsor-grid">
          {filteredSponsors.map(sponsor => (
            <div key={sponsor._id} className="sponsor-card">
              <img
                src={sponsor.logo ? `http://localhost:5000/${sponsor.logo}` : '/default-sponsor.png'}
                alt={sponsor.name}
                className="sponsor-logo"
              />
              <h3>{sponsor.name}</h3>
              <p className="sponsor-description">{sponsor.description?.slice(0, 100)}...</p>
              <div className="sponsor-details">
                {sponsor.website && (
                  <a href={sponsor.website} target="_blank" rel="noopener noreferrer">🌐 {sponsor.website}</a>
                )}
                <span>📧 {sponsor.contactEmail}</span>
                {sponsor.contactPhone && <span>📞 {sponsor.contactPhone}</span>}
              </div>
              <span className={`sponsor-level ${sponsor.level?.toLowerCase()}`}>🏆 {sponsor.level}</span>
              <div className="sponsor-status">
                Status: <span className={`badge status-${sponsor.status}`}>{sponsor.status}</span>
              </div>
              <div className="sponsor-payment">
                Payment: {sponsor.paymentStatus} (${sponsor.amountPaid}/${sponsor.totalAmount})
              </div>
              <div className="sponsor-actions">
                <Link to={`/sponsors/edit/${sponsor._id}`} className="btn-sm">✏️ Edit</Link>
                <button
                  onClick={() => handleDelete(sponsor._id, sponsor.name)}
                  className="btn-sm btn-sm-danger"
                  disabled={actionLoading === sponsor._id}
                >
                  {actionLoading === sponsor._id ? '...' : '🗑️ Delete'}
                </button>
                {sponsor.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(sponsor._id, 'approved')}
                      className="btn-sm btn-sm-success"
                      disabled={actionLoading === sponsor._id}
                    >
                      {actionLoading === sponsor._id ? '...' : '✅ Approve'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(sponsor._id, 'rejected')}
                      className="btn-sm btn-sm-danger"
                      disabled={actionLoading === sponsor._id}
                    >
                      {actionLoading === sponsor._id ? '...' : '❌ Reject'}
                    </button>
                  </>
                )}
                <button
                  onClick={() => handlePaymentUpdate(sponsor._id)}
                  className="btn-sm"
                  disabled={actionLoading === sponsor._id}
                >
                  {actionLoading === sponsor._id ? '...' : '💰 Mark Paid'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SponsorList;

