
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiRequest } from '../api/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import './FormStyles.css';

const SponsorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    level: 'Other',
    events: '',
    totalAmount: '',
    logo: null,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [packagesLoading, setPackagesLoading] = useState(true);

  // Fetch packages on mount
  useEffect(() => {
    const loadPackages = async () => {
      try {
        const data = await apiRequest('/api/packages');
        setPackages(data);
      } catch (err) {
        console.error('Failed to load packages', err);
        toast.error('Could not load sponsorship packages');
      } finally {
        setPackagesLoading(false);
      }
    };
    loadPackages();
  }, []);

  // If editing, fetch sponsor data
  useEffect(() => {
    if (isEdit) fetchSponsor();
  }, [id]);

  const fetchSponsor = async () => {
    setFetching(true);
    try {
      const data = await apiRequest(`/api/sponsors/${id}`);
      setFormData({
        name: data.name,
        description: data.description || '',
        website: data.website || '',
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || '',
        level: data.level,
        events: data.events.map(e => e._id).join(','),
        totalAmount: data.totalAmount,
        logo: null,
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load sponsor');
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  // Phone validation
  const validatePhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (name === 'contactPhone') {
      const cleaned = value.replace(/\D/g, '');
      setPhoneError(cleaned && !validatePhone(cleaned) ? 'Phone must be 10 digits' : '');
      setFormData({ ...formData, [name]: cleaned });
      return;
    }

    if (type === 'file') {
      setFormData({ ...formData, logo: files[0] });
    } else if (name === 'level') {
      const selectedPackage = packages.find(p => p.name === value);
      if (selectedPackage) {
        setFormData({
          ...formData,
          level: value,
          totalAmount: selectedPackage.price,
        });
      } else {
        setFormData({ ...formData, level: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.contactPhone && !validatePhone(formData.contactPhone)) {
      setPhoneError('Phone must be 10 digits');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'logo' && formData.logo) {
          data.append(key, formData.logo);
        } else if (key !== 'logo') {
          data.append(key, formData[key]);
        }
      });

      const url = isEdit ? `/api/sponsors/${id}` : '/api/sponsors';
      const method = isEdit ? 'PUT' : 'POST';
      await apiRequest(url, { method, body: data });
      toast.success(isEdit ? 'Sponsor updated!' : 'Sponsor created!');
      setTimeout(() => navigate('/sponsors'), 1500);
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner size="md" message="Loading sponsor data..." />;

  return (
    <div className="form-container">
      <h2>{isEdit ? '✏️ Edit Sponsor' : '📦 Add New Sponsor'}</h2>
      {error && <div className="error-message">⚠️ {error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>🏢 Sponsor Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>📝 Description</label>
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>🌐 Website</label>
          <input type="url" name="website" value={formData.website} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>📧 Contact Email *</label>
          <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>📞 Contact Phone</label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder="10 digits (e.g., 0712345678)"
          />
          {phoneError && <div className="error-message" style={{ fontSize: '12px', marginTop: '5px' }}>{phoneError}</div>}
        </div>

        <div className="form-group">
          <label>🏆 Sponsorship Package</label>
          {packagesLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <select name="level" value={formData.level} onChange={handleChange} required>
              <option value="">Select a package</option>
              {packages.map(pkg => (
                <option key={pkg._id} value={pkg.name}>
                  {pkg.name} - ${pkg.price}
                </option>
              ))}
              <option value="Other">Other (custom amount)</option>
            </select>
          )}
          <small>Select a package to auto-fill amount, or choose "Other" to set manually.</small>
        </div>

        <div className="form-group">
          <label>💰 Total Sponsorship Amount ($)</label>
          <input
            type="number"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleChange}
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label>📅 Sponsored Events (comma-separated event IDs)</label>
          <input
            type="text"
            name="events"
            value={formData.events}
            onChange={handleChange}
            placeholder="e.g., 66f5b2f8a1b2c3d4e5f6g7h8, ..."
          />
        </div>

        <div className="form-group">
          <label>🖼️ Logo (image)</label>
          <input type="file" name="logo" accept="image/*" onChange={handleChange} />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : (isEdit ? '✏️ Update Sponsor' : '➕ Create Sponsor')}
        </button>
      </form>
    </div>
  );
};

export default SponsorForm;
