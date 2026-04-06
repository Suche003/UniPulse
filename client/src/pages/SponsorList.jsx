import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiRequest } from '../api/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import './SponsorList.css';

const ITEMS_PER_PAGE = 9;

const SponsorList = () => {
  const [sponsors, setSponsors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filteredList = [...sponsors];
    if (statusFilter) filteredList = filteredList.filter(s => s.status === statusFilter);
    if (levelFilter) filteredList = filteredList.filter(s => s.level === levelFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredList = filteredList.filter(s =>
        s.name.toLowerCase().includes(term) ||
        (s.description && s.description.toLowerCase().includes(term))
      );
    }
    setFiltered(filteredList);
    setCurrentPage(1);
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
      toast.success('Sponsor deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setActionLoading(id);
    try {
      await apiRequest(`/api/sponsors/${id}/status`, { method: 'PATCH', body: { status: newStatus } });
      await fetchSponsors();
      toast.success(`Sponsor ${newStatus}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentSponsors = filtered.slice(start, start + ITEMS_PER_PAGE);

  if (loading) return <LoadingSpinner size="lg" message="Loading sponsors..." />;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="sponsor-container">
      <div className="sponsor-header">
        <h2>📦 Sponsors</h2>
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

      {currentSponsors.length === 0 ? (
        <EmptyState title="No sponsors found" message="Try adjusting your filters" />
      ) : (
        <>
          <div className="sponsor-grid">
            {currentSponsors.map(sponsor => {
              const paidPercent = sponsor.totalAmount ? (sponsor.amountPaid / sponsor.totalAmount) * 100 : 0;
              return (
                <div key={sponsor._id} className="sponsor-card">
                  <img
                    src={sponsor.logo ? `http://localhost:5000/${sponsor.logo}` : '/default-sponsor.png'}
                    alt={sponsor.name}
                    className="sponsor-logo"
                  />
                  <h3>{sponsor.name}</h3>
                  <p className="sponsor-description">{sponsor.description?.slice(0, 100)}...</p>
                  <div className="sponsor-details">
                    {sponsor.website && <a href={sponsor.website} target="_blank">🌐 {sponsor.website}</a>}
                    <span>📧 {sponsor.contactEmail}</span>
                    {sponsor.contactPhone && <span>📞 {sponsor.contactPhone}</span>}
                  </div>
                  <span className={`sponsor-level ${sponsor.level?.toLowerCase()}`}>🏆 {sponsor.level}</span>
                  <div className="sponsor-status">
                    Status: <span className={`badge status-${sponsor.status}`}>{sponsor.status}</span>
                  </div>
                  <div className="sponsor-payment">
                    <div className="payment-info">
                      <span>Payment: {sponsor.paymentStatus}</span>
                      <span>(${sponsor.amountPaid}/${sponsor.totalAmount})</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${paidPercent}%` }}></div>
                    </div>
                  </div>
                  <div className="sponsor-actions">
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
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(sponsor._id, 'rejected')}
                          className="btn-sm btn-sm-danger"
                          disabled={actionLoading === sponsor._id}
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                    {/* ❌ No "Record Payment" button for super admin */}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SponsorList;