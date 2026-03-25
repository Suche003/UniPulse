import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiRequest } from '../api/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import './FormStyles.css';

const VendorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    businessType: 'Other',
    participationFee: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (isEdit) fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    setFetching(true);
    try {
      const data = await apiRequest(`/api/vendors/${id}`);
      setFormData({
        name: data.name,
        email: data.email,
        password: '',
        phone: data.phone || '',
        address: data.address || '',
        businessType: data.businessType || 'Other',
        participationFee: data.participationFee || '',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load vendor');
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'email') {
      setEmailError(value && !validateEmail(value) ? 'Invalid email format' : '');
      setFormData({ ...formData, email: value });
    } else if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '');
      setPhoneError(cleaned && !validatePhone(cleaned) ? 'Phone must be 10 digits' : '');
      setFormData({ ...formData, phone: cleaned });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name || !formData.email || (!isEdit && !formData.password)) {
      toast.error('Name, email and password are required');
      setLoading(false);
      return;
    }
    if (!validateEmail(formData.email)) {
      setEmailError('Invalid email format');
      toast.error('Please enter a valid email');
      setLoading(false);
      return;
    }
    if (formData.phone && !validatePhone(formData.phone)) {
      setPhoneError('Phone must be 10 digits');
      toast.error('Phone must be 10 digits');
      setLoading(false);
      return;
    }

    try {
      const body = { ...formData };
      if (isEdit) delete body.password;

      const url = isEdit ? `/api/vendors/${id}` : '/api/vendors';
      const method = isEdit ? 'PUT' : 'POST';
      await apiRequest(url, { method, body });
      toast.success(isEdit ? 'Vendor updated!' : 'Vendor created!');
      setTimeout(() => navigate('/vendors'), 1500);
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner size="md" message="Loading vendor data..." />;

  return (
    <div className="form-container">
      <h2>{isEdit ? '✏️ Edit Vendor' : '🏪 Add New Vendor'}</h2>
      {error && <div className="error-message">⚠️ {error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>👤 Vendor Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>📧 Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {emailError && <div className="error-message" style={{ fontSize: '12px', marginTop: '5px' }}>{emailError}</div>}
        </div>

        <div className="form-group">
          <label>🔒 Password {!isEdit && '*'}</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEdit}
          />
          {isEdit && <small>Leave blank to keep current password</small>}
        </div>

        <div className="form-group">
          <label>📞 Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="10 digits (e.g., 0712345678)"
          />
          {phoneError && <div className="error-message" style={{ fontSize: '12px', marginTop: '5px' }}>{phoneError}</div>}
        </div>

        <div className="form-group">
          <label>📍 Address</label>
          <textarea name="address" rows="3" value={formData.address} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>🏷️ Business Type</label>
          <select name="businessType" value={formData.businessType} onChange={handleChange}>
            <option value="Food">Food</option>
            <option value="Merchandise">Merchandise</option>
            <option value="Services">Services</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>💰 Participation Fee</label>
          <input type="number" name="participationFee" value={formData.participationFee} onChange={handleChange} />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : (isEdit ? '✏️ Update Vendor' : '➕ Create Vendor')}
        </button>
      </form>
    </div>
  );
};

export default VendorForm;