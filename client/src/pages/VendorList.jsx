import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiRequest } from '../api/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import './VendorList.css';

const VendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vendors, statusFilter, businessTypeFilter, searchTerm]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/api/vendors');
      setVendors(data);
      setError('');
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...vendors];
    if (statusFilter) filtered = filtered.filter(v => v.status === statusFilter);
    if (businessTypeFilter) filtered = filtered.filter(v => v.businessType === businessTypeFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(term) ||
        v.email.toLowerCase().includes(term)
      );
    }
    setFilteredVendors(filtered);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setBusinessTypeFilter('');
    setSearchTerm('');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete vendor "${name}"? This action cannot be undone.`)) return;
    setActionLoading(id);
    try {
      await apiRequest(`/api/vendors/${id}`, { method: 'DELETE' });
      setVendors(vendors.filter(v => v._id !== id));
      toast.success('Vendor deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete vendor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setActionLoading(id);
    try {
      await apiRequest(`/api/vendors/${id}/status`, { method: 'PATCH', body: { status: newStatus } });
      await fetchVendors();
      toast.success(`Vendor ${newStatus} successfully`);
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
      await apiRequest(`/api/vendors/${id}/payment`, { method: 'PATCH', body: { paymentStatus: 'paid', amountPaid: amount } });
      await fetchVendors();
      toast.success(`Payment recorded: $${amount}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAgreementUpload = async (id) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('agreement', file);
      setActionLoading(id);
      try {
        await apiRequest(`/api/vendors/${id}/agreement`, { method: 'POST', body: formData });
        toast.success('Agreement uploaded!');
        await fetchVendors();
      } catch (err) {
        toast.error(err.message || 'Failed to upload agreement');
      } finally {
        setActionLoading(null);
      }
    };
    fileInput.click();
  };

  if (loading) return <LoadingSpinner size="lg" message="Loading vendors..." />;
  if (error) return (
    <div className="vendor-container">
      <div className="error-message">Error: {error}</div>
      <button className="btn-primary" onClick={fetchVendors}>Retry</button>
    </div>
  );

  return (
    <div className="vendor-container">
      <div className="vendor-header">
        <h2>🏪 Vendors</h2>
        <Link to="/vendors/new" className="btn-primary">➕ Add Vendor</Link>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name or email..."
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
          <select value={businessTypeFilter} onChange={e => setBusinessTypeFilter(e.target.value)}>
            <option value="">All Business Types</option>
            <option value="Food">Food</option>
            <option value="Merchandise">Merchandise</option>
            <option value="Services">Services</option>
            <option value="Other">Other</option>
          </select>
          <button className="btn-sm" onClick={clearFilters}>Clear Filters</button>
        </div>
      </div>

      {filteredVendors.length === 0 ? (
        <EmptyState
          title="No vendors found"
          message={searchTerm || statusFilter || businessTypeFilter ? "Try adjusting your filters" : "Get started by adding your first vendor"}
          actionText={searchTerm || statusFilter || businessTypeFilter ? "Clear Filters" : "Add Vendor"}
          onAction={searchTerm || statusFilter || businessTypeFilter ? clearFilters : () => window.location.href = "/vendors/new"}
        />
      ) : (
        <div className="vendor-table-wrapper">
          <table className="vendor-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Business Type</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map(vendor => (
                <tr key={vendor._id}>
                  <td><strong>{vendor.name}</strong></td>
                  <td>{vendor.email}</td>
                  <td>{vendor.businessType}</td>
                  <td>
                    <span className={`badge status-${vendor.status}`}>{vendor.status}</span>
                  </td>
                  <td>
                    {vendor.paymentStatus} (${vendor.amountPaid}/${vendor.participationFee})
                  </td>
                  <td className="actions">
                    <Link to={`/vendors/edit/${vendor._id}`} className="btn-sm">✏️ Edit</Link>
                    <button
                      onClick={() => handleDelete(vendor._id, vendor.name)}
                      className="btn-sm btn-sm-danger"
                      disabled={actionLoading === vendor._id}
                    >
                      {actionLoading === vendor._id ? '...' : '🗑️ Delete'}
                    </button>
                    {vendor.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(vendor._id, 'approved')}
                          className="btn-sm btn-sm-success"
                          disabled={actionLoading === vendor._id}
                        >
                          {actionLoading === vendor._id ? '...' : '✅ Approve'}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(vendor._id, 'rejected')}
                          className="btn-sm btn-sm-danger"
                          disabled={actionLoading === vendor._id}
                        >
                          {actionLoading === vendor._id ? '...' : '❌ Reject'}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handlePaymentUpdate(vendor._id)}
                      className="btn-sm"
                      disabled={actionLoading === vendor._id}
                    >
                      {actionLoading === vendor._id ? '...' : '💰 Mark Paid'}
                    </button>
                    <button
                      onClick={() => handleAgreementUpload(vendor._id)}
                      className="btn-sm"
                      disabled={actionLoading === vendor._id}
                    >
                      {actionLoading === vendor._id ? '...' : '📄 Upload Agreement'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VendorList;