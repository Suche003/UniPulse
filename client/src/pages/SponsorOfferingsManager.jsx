import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import './SponsorOfferingsManager.css';

const SponsorOfferingsManager = () => {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
    eventCategories: '',
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOfferings();
  }, []);

  const fetchOfferings = async () => {
    try {
      const data = await apiRequest('/api/offerings/my-offerings');
      setOfferings(data);
    } catch (err) {
      toast.error('Failed to load offerings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...formData,
      budgetMin: parseFloat(formData.budgetMin) || undefined,
      budgetMax: parseFloat(formData.budgetMax) || undefined,
      eventCategories: formData.eventCategories.split(',').map(c => c.trim()).filter(c => c),
    };
    try {
      if (editing) {
        await apiRequest(`/api/offerings/${editing}`, { method: 'PUT', body: payload });
        toast.success('Offering updated');
      } else {
        await apiRequest('/api/offerings', { method: 'POST', body: payload });
        toast.success('Offering created');
      }
      fetchOfferings();
      setShowForm(false);
      setEditing(null);
      setFormData({ title: '', description: '', budgetMin: '', budgetMax: '', eventCategories: '', status: 'active' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this offering?')) return;
    try {
      await apiRequest(`/api/offerings/${id}`, { method: 'DELETE' });
      toast.success('Offering deleted');
      fetchOfferings();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (offering) => {
    setEditing(offering._id);
    setFormData({
      title: offering.title,
      description: offering.description || '',
      budgetMin: offering.budgetMin || '',
      budgetMax: offering.budgetMax || '',
      eventCategories: (offering.eventCategories || []).join(', '),
      status: offering.status,
    });
    setShowForm(true);
  };

  if (loading) return <LoadingSpinner size="md" />;

  return (
    <div className="offerings-manager">
      <div className="header">
        <h2>Sponsorship Offerings</h2>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setFormData({ title: '', description: '', budgetMin: '', budgetMax: '', eventCategories: '', status: 'active' }); }}>
          + New Offering
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editing ? 'Edit Offering' : 'Create Offering'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Min Budget ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.budgetMin}
                    onChange={e => setFormData({ ...formData, budgetMin: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Max Budget ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.budgetMax}
                    onChange={e => setFormData({ ...formData, budgetMax: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label>Event Categories (comma-separated)</label>
                <input
                  type="text"
                  value={formData.eventCategories}
                  onChange={e => setFormData({ ...formData, eventCategories: e.target.value })}
                  placeholder="e.g., tech, sports, cultural"
                />
              </div>
              <div className="field">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editing ? 'Update' : 'Create')}
                </button>
                <button type="button" className="btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {offerings.length === 0 ? (
        <p>No offerings yet. Click "New Offering" to create one.</p>
      ) : (
        <div className="offerings-list">
          {offerings.map(offering => (
            <div key={offering._id} className="offering-card">
              <h3>{offering.title}</h3>
              <p>{offering.description}</p>
              <div className="budget">
                Budget: {offering.budgetMin ? `$${offering.budgetMin}` : 'Any'} - {offering.budgetMax ? `$${offering.budgetMax}` : 'Any'}
              </div>
              <div className="categories">
                Categories: {offering.eventCategories.join(', ') || 'Any'}
              </div>
              <div className="status">
                Status: <span className={`badge status-${offering.status}`}>{offering.status}</span>
              </div>
              <div className="actions">
                <button className="btn-sm" onClick={() => handleEdit(offering)}>Edit</button>
                <button className="btn-sm btn-sm-danger" onClick={() => handleDelete(offering._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SponsorOfferingsManager;