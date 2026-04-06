import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import DetailedProposalForm from './DetailedProposalForm';
import './SponsorMarketplace.css';

const SponsorMarketplace = () => {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState(null);

  useEffect(() => {
    fetchOfferings();
  }, []);

  const fetchOfferings = async () => {
    try {
      const data = await apiRequest('/api/offerings/public');
      // Ensure each offering has a sponsor object with at least a name
      const validOfferings = data.filter(offering => offering.sponsor !== null);
      setOfferings(validOfferings);
    } catch (err) {
      toast.error('Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  const openRequestModal = (offering) => {
    setSelectedOffering(offering);
    setShowModal(true);
  };

  if (loading) return <LoadingSpinner size="lg" message="Loading marketplace..." />;

  return (
    <div className="sponsor-marketplace">
      <h1>Sponsorship Marketplace</h1>
      <p>Browse sponsorship opportunities offered by companies and organizations.</p>

      {offerings.length === 0 ? (
        <p>No active offerings at the moment.</p>
      ) : (
        <div className="offerings-grid">
          {offerings.map(offering => (
            <div key={offering._id} className="offering-card">
              <div className="offering-header">
                <img
                  src={offering.sponsor?.logo ? `http://localhost:5000/${offering.sponsor.logo}` : '/default-sponsor.png'}
                  alt={offering.sponsor?.name || 'Sponsor'}
                  className="sponsor-logo-small"
                />
                <h3>{offering.sponsor?.name || 'Unknown Sponsor'}</h3>
              </div>
              <h4>{offering.title}</h4>
              <p>{offering.description}</p>
              <div className="budget-range">
                Budget: {offering.budgetMin ? `$${offering.budgetMin}` : 'Any'} - {offering.budgetMax ? `$${offering.budgetMax}` : 'Any'}
              </div>
              <div className="categories">
                Categories: {offering.eventCategories?.join(', ') || 'Any'}
              </div>
              <button className="btn-primary" onClick={() => openRequestModal(offering)}>
                Request Sponsorship
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedOffering && (
        <DetailedProposalForm
          sponsor={selectedOffering.sponsor}
          event={null}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            toast.success('Proposal sent successfully!');
          }}
        />
      )}
    </div>
  );
};

export default SponsorMarketplace;