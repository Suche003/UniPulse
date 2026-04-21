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
      // Filter out offerings without a valid sponsor (just in case)
      const validOfferings = data.filter(offering => offering.sponsor !== null);
      setOfferings(validOfferings);
    } catch (err) {
      toast.error('Failed to load marketplace');
      console.error(err);
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
      <div className="marketplace-header">
        <h1>Sponsorship Marketplace</h1>
        <p>Browse sponsorship opportunities offered by companies and organizations.</p>
      </div>

      {offerings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No active offerings at the moment</h3>
          <p>Check back later for new sponsorship opportunities.</p>
        </div>
      ) : (
        <div className="offerings-grid">
          {offerings.map(offering => (
            <div key={offering._id} className="offering-card">
              <div className="offering-card-header">
                {offering.sponsor?.logo && (
                  <img
                    src={`http://localhost:5000/${offering.sponsor.logo}`}
                    alt={offering.sponsor.name}
                    className="sponsor-logo"
                  />
                )}
                <div className="sponsor-info">
                  <h3 className="sponsor-name">{offering.sponsor?.name || 'Unknown Sponsor'}</h3>
                  {offering.sponsor?.level && (
                    <span className={`sponsor-level-badge ${offering.sponsor.level.toLowerCase()}`}>
                      {offering.sponsor.level}
                    </span>
                  )}
                </div>
              </div>

              <div className="offering-card-body">
                <h4 className="offering-title">{offering.title}</h4>
                <p className="offering-description">{offering.description || 'No description provided.'}</p>
                
                <div className="offering-details">
                  <div className="budget-range">
                    <span className="detail-label">💰 Budget:</span>
                    <span className="detail-value">
                      {offering.budgetMin ? `$${offering.budgetMin}` : 'Any'} – 
                      {offering.budgetMax ? `$${offering.budgetMax}` : 'Any'}
                    </span>
                  </div>
                  
                  {offering.eventCategories && offering.eventCategories.length > 0 && (
                    <div className="categories">
                      <span className="detail-label">🏷️ Categories:</span>
                      <div className="category-tags">
                        {offering.eventCategories.map((cat, idx) => (
                          <span key={idx} className="category-tag">{cat}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="offering-card-footer">
                <button 
                  className="btn-primary request-btn" 
                  onClick={() => openRequestModal(offering)}
                >
                  Request Sponsorship
                </button>
              </div>
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