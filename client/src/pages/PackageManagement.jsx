import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiRequest } from '../api/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import './PackageManagement.css';

const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: 'Other', description: '', price: 0, benefits: [] });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const data = await apiRequest('/api/packages');
      setPackages(data);
    } catch (err) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editing ? `/api/packages/${editing}` : '/api/packages';
    const method = editing ? 'PUT' : 'POST';
    try {
      await apiRequest(url, { method, body: formData });
      toast.success(editing ? 'Package updated' : 'Package created');
      setEditing(null);
      setFormData({ name: 'Other', description: '', price: 0, benefits: [] });
      fetchPackages();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this package?')) {
      try {
        await apiRequest(`/api/packages/${id}`, { method: 'DELETE' });
        toast.success('Package deleted');
        fetchPackages();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const handleEdit = (pkg) => {
    setEditing(pkg._id);
    setFormData({ name: pkg.name, description: pkg.description, price: pkg.price, benefits: pkg.benefits });
  };

  const addBenefit = () => {
    setFormData({ ...formData, benefits: [...formData.benefits, ''] });
  };
  const updateBenefit = (idx, val) => {
    const newBenefits = [...formData.benefits];
    newBenefits[idx] = val;
    setFormData({ ...formData, benefits: newBenefits });
  };
  const removeBenefit = (idx) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== idx);
    setFormData({ ...formData, benefits: newBenefits });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="package-container">
      <h2>Sponsorship Packages</h2>
      <div className="package-form">
        <h3>{editing ? 'Edit Package' : 'Add New Package'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <select value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Price ($)</label>
            <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} required />
          </div>
          <div className="form-group">
            <label>Benefits</label>
            {formData.benefits.map((b, idx) => (
              <div key={idx} className="benefit-row">
                <input value={b} onChange={e => updateBenefit(idx, e.target.value)} placeholder="Benefit" />
                <button type="button" onClick={() => removeBenefit(idx)}>✖️</button>
              </div>
            ))}
            <button type="button" onClick={addBenefit}>+ Add Benefit</button>
          </div>
          <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setFormData({ name: 'Other', description: '', price: 0, benefits: [] }); }}>Cancel</button>}
        </form>
      </div>

      <div className="package-list">
        <h3>Existing Packages</h3>
        <div className="package-grid">
          {packages.map(pkg => (
            <div key={pkg._id} className="package-card">
              <h4>{pkg.name}</h4>
              <p>{pkg.description}</p>
              <p className="price">${pkg.price}</p>
              <ul>
                {pkg.benefits.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
              <div className="actions">
                <button onClick={() => handleEdit(pkg)} className="btn-sm">✏️ Edit</button>
                <button onClick={() => handleDelete(pkg._id)} className="btn-sm btn-sm-danger">🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PackageManagement;