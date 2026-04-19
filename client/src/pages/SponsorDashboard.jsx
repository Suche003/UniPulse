import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import SponsorAnalytics from './SponsorAnalytics';
import SponsorOfferingsManager from './SponsorOfferingsManager';
import SponsorshipDetail from './SponsorshipDetail';
import Navbar from '../components/Navbar';          
import './SponsorDashboard.css';

const SponsorDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [editingProfile, setEditingProfile] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  // Separate states for logo to avoid confusion
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [removeLogo, setRemoveLogo] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '',
    description: '',
    website: '',
    contactPhone: '',
    socialLinks: { linkedin: '', twitter: '', facebook: '', instagram: '' },
    contacts: [],
  });

  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', role: '' });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    fetchProfile();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsData, paymentsData] = await Promise.all([
        apiRequest('/api/sponsorship-requests/my-requests'),
        apiRequest('/api/payments/my-payments')
      ]);
      const sortedRequests = [...requestsData].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRequests(sortedRequests);
      setPayments(paymentsData);
    } catch (err) {
      toast.error('Failed to load data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const sponsor = await apiRequest('/api/sponsors/profile');
      setProfile(sponsor);
      setProfileForm({
        name: sponsor.name,
        description: sponsor.description || '',
        website: sponsor.website || '',
        contactPhone: sponsor.contactPhone || '',
        socialLinks: sponsor.socialLinks || { linkedin: '', twitter: '', facebook: '', instagram: '' },
        contacts: sponsor.contacts || [],
      });
      // Set logo preview from existing logo
      if (sponsor.logo) {
        setLogoPreview(`http://localhost:5000/${sponsor.logo}`);
      } else {
        setLogoPreview(null);
      }
      setLogoFile(null);
      setRemoveLogo(false);
      const ratingData = await apiRequest(`/api/ratings/average/${sponsor._id}/Sponsor`);
      setAvgRating(ratingData.avgRating);
    } catch (err) {
      toast.error('Failed to load profile');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setTouched({ name: true, contactPhone: true });

    if (!profileForm.name.trim()) {
      toast.error('Organization name is required');
      return;
    }
    const cleanPhone = profileForm.contactPhone.replace(/\D/g, '');
    if (cleanPhone && !/^\d{10}$/.test(cleanPhone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', profileForm.name);
      formData.append('description', profileForm.description);
      formData.append('website', profileForm.website);
      formData.append('contactPhone', cleanPhone);
      formData.append('socialLinks', JSON.stringify(profileForm.socialLinks));
      formData.append('contacts', JSON.stringify(profileForm.contacts));
      
      // Logo handling
      if (removeLogo) {
        formData.append('removeLogo', 'true');
        console.log('Removing logo');
      } else if (logoFile) {
        formData.append('logo', logoFile);
        console.log('Uploading new logo:', logoFile.name);
      }

      // Log FormData contents for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await apiRequest('/api/sponsors/profile', { 
        method: 'PUT', 
        body: formData,
        headers: {} // important: don't set Content-Type
      });
      
      toast.success('Profile updated successfully!');
      setEditingProfile(false);
      fetchProfile(); // refresh to get new logo URL
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const addContact = () => {
    if (!newContact.name || !newContact.email) {
      toast.error('Name and email are required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(newContact.email)) {
      toast.error('Invalid email format');
      return;
    }
    setProfileForm({
      ...profileForm,
      contacts: [...profileForm.contacts, { ...newContact }],
    });
    setNewContact({ name: '', email: '', phone: '', role: '' });
  };

  const removeContact = (index) => {
    const newContacts = [...profileForm.contacts];
    newContacts.splice(index, 1);
    setProfileForm({ ...profileForm, contacts: newContacts });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo must be less than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setRemoveLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const totalRequests = requests.length;
  const acceptedRequests = requests.filter(r => r.status === 'accepted' || r.status === 'meeting_scheduled').length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  if (loading) return <LoadingSpinner size="lg" message="Loading dashboard..." />;

  return (
    <>
      <Navbar /> {/* ✅ Navbar rendered here */}
      <div className="sponsor-dashboard">
        {/* Hero Section */}
        <div className="dashboard-hero">
          <div className="hero-content">
            <h1>Welcome back, {profile?.name} 👋</h1>
            <p>Manage your sponsorships, track payments, and grow your brand impact</p>
            {avgRating > 0 && (
              <div className="rating-badge">⭐ {avgRating.toFixed(1)} / 5 (average rating from clubs)</div>
            )}
          </div>
          {profile?.status === 'pending' && (
            <div className="alert">⏳ Your account is awaiting admin approval.</div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-value">{totalRequests}</div>
            <div className="stat-label">Total Requests</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{acceptedRequests}</div>
            <div className="stat-label">Accepted</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">${totalPaid.toLocaleString()}</div>
            <div className="stat-label">Total Paid</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{pendingRequests}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>
            📬 Sponsorship Requests
          </button>
          <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>
            💳 Payment History
          </button>
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
            👤 Company Profile
          </button>
          <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
            📊 Analytics
          </button>
          <button className={activeTab === 'offerings' ? 'active' : ''} onClick={() => setActiveTab('offerings')}>
            🛒 Sponsorship Offerings
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'requests' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn-sm" onClick={handleRefresh} disabled={refreshing}>
                  {refreshing ? 'Refreshing...' : '🔄 Refresh'}
                </button>
              </div>
              {requests.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No sponsorship requests yet</h3>
                  <p>When clubs send you sponsorship proposals, they will appear here.</p>
                </div>
              ) : (
                <div className="requests-list">
                  {requests.map(req => (
                    <SponsorshipDetail
                      key={req._id}
                      request={req}
                      onRefresh={fetchData}
                      userRole="sponsor"
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'payments' && (
            <>
              {payments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💸</div>
                  <h3>No payments recorded yet</h3>
                  <p>Once you make payments, you'll see them here.</p>
                </div>
              ) : (
                <div className="payments-table-wrapper">
                  <table className="payments-table">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Transaction ID</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p._id}>
                          <td>{p.event?.title || 'N/A'}</td>
                          <td><strong>${p.amount.toLocaleString()}</strong></td>
                          <td>{new Date(p.paidAt).toLocaleDateString()}</td>
                          <td>{p.transactionId || '—'}</td>
                          <td><span className="badge success">completed</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section">
              {!editingProfile ? (
                // View mode
                <div className="profile-view">
                  <div className="profile-avatar">
                    {logoPreview && !removeLogo ? (
                      <img 
                        src={logoPreview} 
                        alt={profile?.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="default-avatar">🏢</div>';
                        }}
                      />
                    ) : (
                      <div className="default-avatar">🏢</div>
                    )}
                  </div>
                  <div className="profile-details">
                    <h3>{profile?.name}</h3>
                    {avgRating > 0 && (
                      <div className="rating-display">⭐ {avgRating.toFixed(1)} / 5 (from clubs)</div>
                    )}
                    <p className="profile-description">{profile?.description || 'No description provided'}</p>
                    <div className="profile-info-grid">
                      <div><span>📧</span> {profile?.contactEmail}</div>
                      <div><span>📞</span> {profile?.contactPhone || 'Not provided'}</div>
                      <div><span>🌐</span> {profile?.website ? <a href={profile.website} target="_blank" rel="noopener noreferrer">{profile.website}</a> : 'Not provided'}</div>
                      <div><span>🏆</span> Level: {profile?.level}</div>
                    </div>
                    {profile?.socialLinks && Object.values(profile.socialLinks).some(v => v) && (
                      <div className="social-links">
                        <strong>Social Media</strong>
                        <div className="links">
                          {profile.socialLinks.linkedin && <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">🔗 LinkedIn</a>}
                          {profile.socialLinks.twitter && <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">🐦 Twitter</a>}
                          {profile.socialLinks.facebook && <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer">📘 Facebook</a>}
                          {profile.socialLinks.instagram && <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer">📷 Instagram</a>}
                        </div>
                      </div>
                    )}
                    {profile?.contacts?.length > 0 && (
                      <div className="contacts">
                        <strong>📇 Contact Persons</strong>
                        {profile.contacts.map((c, idx) => (
                          <div key={idx} className="contact-card">
                            <div><strong>{c.name}</strong> {c.role && `(${c.role})`}</div>
                            <div>{c.email} | {c.phone}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="btn-primary" onClick={() => setEditingProfile(true)}>✏️ Edit Profile</button>
                </div>
              ) : (
                // Edit mode
                <form onSubmit={handleProfileUpdate} className="profile-form">
                  <h3>Edit Company Profile</h3>

                  {/* Basic Information */}
                  <div className="form-card">
                    <h4>Basic Information</h4>
                    <div className="field">
                      <label>Organization Name *</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="e.g., GreenFuture Innovations Ltd"
                      />
                      {touched.name && !profileForm.name.trim() && (
                        <div className="field-error">Name is required</div>
                      )}
                    </div>

                    <div className="field">
                      <label>Description</label>
                      <textarea
                        value={profileForm.description}
                        onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                        rows="4"
                        placeholder="Tell clubs about your mission, values, and sponsorship interests"
                        maxLength="500"
                      />
                      <div className="char-counter">{profileForm.description.length}/500 characters</div>
                    </div>

                    <div className="field-row">
                      <div className="field">
                        <label>Website</label>
                        <input
                          type="url"
                          value={profileForm.website}
                          onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                          placeholder="https://yourcompany.com"
                        />
                      </div>
                      <div className="field">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          value={profileForm.contactPhone}
                          onChange={(e) => setProfileForm({ ...profileForm, contactPhone: e.target.value.replace(/\D/g, '') })}
                          placeholder="0712345678"
                        />
                        <small className="hint">10 digits only (e.g., 0771234867)</small>
                        {touched.contactPhone && profileForm.contactPhone && !/^\d{10}$/.test(profileForm.contactPhone) && (
                          <div className="field-error">Must be exactly 10 digits</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="form-card">
                    <h4>Social Media</h4>
                    <div className="field">
                      <label>LinkedIn</label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/company/..."
                        value={profileForm.socialLinks.linkedin}
                        onChange={(e) => setProfileForm({
                          ...profileForm,
                          socialLinks: { ...profileForm.socialLinks, linkedin: e.target.value }
                        })}
                      />
                    </div>
                    <div className="field">
                      <label>Twitter</label>
                      <input
                        type="url"
                        placeholder="https://twitter.com/..."
                        value={profileForm.socialLinks.twitter}
                        onChange={(e) => setProfileForm({
                          ...profileForm,
                          socialLinks: { ...profileForm.socialLinks, twitter: e.target.value }
                        })}
                      />
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Facebook</label>
                        <input
                          type="url"
                          placeholder="https://facebook.com/..."
                          value={profileForm.socialLinks.facebook}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            socialLinks: { ...profileForm.socialLinks, facebook: e.target.value }
                          })}
                        />
                      </div>
                      <div className="field">
                        <label>Instagram</label>
                        <input
                          type="url"
                          placeholder="https://instagram.com/..."
                          value={profileForm.socialLinks.instagram}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            socialLinks: { ...profileForm.socialLinks, instagram: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Persons */}
                  <div className="form-card">
                    <h4>Contact Persons</h4>
                    {profileForm.contacts.length === 0 && (
                      <div className="empty-contacts">No contacts added yet.</div>
                    )}
                    {profileForm.contacts.map((contact, idx) => (
                      <div key={idx} className="contact-row">
                        <div>
                          <strong>{contact.name}</strong> {contact.role && `(${contact.role})`}<br />
                          <small>{contact.email} {contact.phone && `| ${contact.phone}`}</small>
                        </div>
                        <button type="button" className="btn-remove" onClick={() => removeContact(idx)}>Remove</button>
                      </div>
                    ))}
                    <div className="add-contact">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      />
                      <input
                        type="email"
                        placeholder="Email *"
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Phone"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value.replace(/\D/g, '') })}
                      />
                      <input
                        type="text"
                        placeholder="Role (e.g., Marketing Manager)"
                        value={newContact.role}
                        onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                      />
                      <button type="button" className="btn-add" onClick={addContact}>+ Add Contact</button>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div className="form-card">
                    <h4>Company Logo</h4>
                    <div className="logo-area">
                      {logoPreview && !removeLogo && (
                        <div className="logo-preview">
                          <img src={logoPreview} alt="Company logo preview" />
                          <button 
                            type="button" 
                            className="btn-remove-logo" 
                            onClick={handleRemoveLogo}
                            title="Remove logo"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                      <label className="btn-upload">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={handleLogoChange}
                          style={{ display: 'none' }}
                        />
                        <span>{logoPreview && !removeLogo ? 'Change Logo' : 'Upload Logo'}</span>
                      </label>
                      <small className="hint">Square image, max 2MB (JPG, PNG, WEBP)</small>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="form-actions">
                    <button type="submit" className="btn-save" disabled={submitting}>
                      {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" className="btn-cancel" onClick={() => {
                      setEditingProfile(false);
                      // Reset logo states to original profile data
                      if (profile?.logo) {
                        setLogoPreview(`http://localhost:5000/${profile.logo}`);
                      } else {
                        setLogoPreview(null);
                      }
                      setLogoFile(null);
                      setRemoveLogo(false);
                    }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'analytics' && <SponsorAnalytics />}
          {activeTab === 'offerings' && <SponsorOfferingsManager />}
        </div>
      </div>
    </>
  );
};

export default SponsorDashboard;