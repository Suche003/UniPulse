import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiRequest } from '../api/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import './VendorDashboard.css';

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [stallRequests, setStallRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestForm, setRequestForm] = useState({ eventId: '', stallType: 'Standard' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('unipulse_user'));
      const [vendorData, bookingsData, eventsData, stallRequestsData] = await Promise.all([
        apiRequest(`/api/vendors/${user.id}`),
        apiRequest('/api/bookings'),
        apiRequest('/api/events'),
        apiRequest('/api/stall-requests')
      ]);
      setVendor(vendorData);
      setBookings(bookingsData);
      setEvents(eventsData);
      setStallRequests(stallRequestsData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.eventId) {
      toast.error('Please select an event');
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest('/api/stall-requests', { method: 'POST', body: requestForm });
      toast.success('Stall request submitted!');
      setRequestForm({ eventId: '', stallType: 'Standard' });
      // refresh requests
      const updated = await apiRequest('/api/stall-requests');
      setStallRequests(updated);
    } catch (err) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="vendor-dashboard">
      <h1>🏪 Vendor Dashboard</h1>
      {vendor && (
        <div className="vendor-profile">
          <h2>Welcome, {vendor.name}!</h2>
          <p>Email: {vendor.email} | Status: {vendor.status}</p>
          <p>Payment: {vendor.paymentStatus} (${vendor.amountPaid}/${vendor.participationFee})</p>
          <Link to={`/vendors/edit/${vendor._id}`} className="btn-sm">✏️ Edit Profile</Link>
        </div>
      )}

      {/* Stall Request Form */}
      <div className="section">
        <h2>Request a Stall</h2>
        <form onSubmit={handleRequestSubmit} className="stall-request-form">
          <select
            value={requestForm.eventId}
            onChange={e => setRequestForm({ ...requestForm, eventId: e.target.value })}
            required
          >
            <option value="">Select Event</option>
            {events.map(e => (
              <option key={e._id} value={e._id}>{e.title} ({new Date(e.date).toLocaleDateString()})</option>
            ))}
          </select>
          <select
            value={requestForm.stallType}
            onChange={e => setRequestForm({ ...requestForm, stallType: e.target.value })}
          >
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
            <option value="VIP">VIP</option>
          </select>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      {/* Existing Bookings Section */}
      <div className="dashboard-sections">
        <div className="section">
          <h2>Your Bookings</h2>
          {bookings.filter(b => b.vendorId?._id === vendor?._id).length === 0 ? (
            <p>No bookings yet.</p>
          ) : (
            <ul>
              {bookings.filter(b => b.vendorId?._id === vendor?._id).map(b => (
                <li key={b._id}>
                  {b.eventId?.title} - Stall {b.stallId?.stallNumber} ({b.status})
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="section">
          <h2>Your Stall Requests</h2>
          {stallRequests.length === 0 ? (
            <p>No stall requests yet.</p>
          ) : (
            <ul>
              {stallRequests.map(r => (
                <li key={r._id}>
                  {r.eventId?.title} - {r.stallType} Stall - Status: {r.status}
                  {r.adminNote && <small> Note: {r.adminNote}</small>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}