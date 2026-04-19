import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import './SponsorDirectory.css';

const SponsorDirectory = () => {
  const [sponsors, setSponsors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    eventId: '',
    proposedAmount: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSponsors();
    fetchEvents();
  }, []);

  useEffect(() => {
    let filteredList = [...sponsors];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredList = filteredList.filter(s =>
        s.name.toLowerCase().includes(term) ||
        (s.description && s.description.toLowerCase().includes(term))
      );
    }
    if (levelFilter) filteredList = filteredList.filter(s => s.level === levelFilter);
    setFiltered(filteredList);
  }, [sponsors, searchTerm, levelFilter]);

  const fetchSponsors = async () => {
    try {
      const data = await apiRequest('/api/sponsors/public');
      // Fetch average rating for each sponsor
      const sponsorsWithRatings = await Promise.all(
        data.map(async (sponsor) => {
          try {
            const ratingData = await fetch(`http://localhost:5000/api/ratings/average/${sponsor._id}/Sponsor`)
              .then(res => res.json());
            return { ...sponsor, avgRating: ratingData.avgRating, ratingCount: ratingData.count };
          } catch {
            return { ...sponsor, avgRating: 0, ratingCount: 0 };
          }
        })
      );
      setSponsors(sponsorsWithRatings);
      setFiltered(sponsorsWithRatings);
    } catch (err) {
      toast.error('Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await apiRequest('/api/events');
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openRequestModal = (sponsor) => {
    setSelectedSponsor(sponsor);
    setShowModal(true);
    setForm({ eventId: '', proposedAmount: '', message: '' });
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!form.eventId || !form.proposedAmount) {
      toast.error('Please select an event and enter proposed amount');
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest('/api/sponsorship-requests', {
        method: 'POST',
        body: {
          eventId: form.eventId,
          sponsorId: selectedSponsor._id,
          proposedAmount: parseFloat(form.proposedAmount),
          message: form.message,
        },
      });
      toast.success('Sponsorship request sent!');
      setShowModal(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" message="Loading sponsors..." />;

  return (
    <div className="sponsor-directory">
      <h1>Sponsor Directory</h1>
      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search sponsors..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
          <option value="">All Levels</option>
          <option value="Platinum">Platinum</option>
          <option value="Gold">Gold</option>
          <option value="Silver">Silver</option>
          <option value="Bronze">Bronze</option>
        </select>
      </div>

      <div className="sponsor-grid">
        {filtered.map(sponsor => (
          <div key={sponsor._id} className="sponsor-card">
            {sponsor.logo && (
              <img
                src={`http://localhost:5000/${sponsor.logo}`}
                alt={sponsor.name}
                className="sponsor-logo"
              />
            )}
            <h3>{sponsor.name}</h3>
            {/* Display average rating */}
            {sponsor.avgRating > 0 && (
              <div className="sponsor-rating">
                ⭐ {sponsor.avgRating.toFixed(1)} / 5 ({sponsor.ratingCount} {sponsor.ratingCount === 1 ? 'review' : 'reviews'})
              </div>
            )}
            <p className="sponsor-description">{sponsor.description?.slice(0, 100)}</p>
            <div className="sponsor-details">
              <span>📧 {sponsor.contactEmail}</span>
              {sponsor.contactPhone && <span>📞 {sponsor.contactPhone}</span>}
              {sponsor.website && (
                <a href={sponsor.website} target="_blank" rel="noopener noreferrer">🌐 Website</a>
              )}
            </div>
            <span className={`sponsor-level ${sponsor.level?.toLowerCase()}`}>🏆 {sponsor.level}</span>
            <button className="btn-primary" onClick={() => openRequestModal(sponsor)}>
              Request Sponsorship
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Request Sponsorship from {selectedSponsor.name}</h3>
            <form onSubmit={handleSubmitRequest}>
              <div className="field">
                <label>Select Event *</label>
                <select
                  value={form.eventId}
                  onChange={e => setForm({ ...form, eventId: e.target.value })}
                  required
                >
                  <option value="">Choose an event</option>
                  {events.map(ev => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title} – {new Date(ev.date).toLocaleDateString()} @ {ev.location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Proposed Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.proposedAmount}
                  onChange={e => setForm({ ...form, proposedAmount: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>Message (optional)</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value.slice(0, 500) })}
                  rows="3"
                  maxLength="500"
                  placeholder="Add any additional context..."
                />
                <small>{form.message.length}/500 characters</small>
              </div>
              <div className="actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
                <button type="button" className="btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorDirectory;