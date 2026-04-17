import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import SponsorshipDetail from './SponsorshipDetail';
import './ClubRequests.css';

const ClubRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await apiRequest('/api/sponsorship-requests/my-club-requests');
      setRequests(data);
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" message="Loading your requests..." />;

  return (
    <div className="club-requests-page">
      <h1>My Sponsorship Requests</h1>
      {requests.length === 0 ? (
        <div className="empty-state">
          <p>No requests sent yet.</p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map(req => (
            <SponsorshipDetail
              key={req._id}
              request={req}
              onRefresh={fetchRequests}
              userRole="club"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubRequests;