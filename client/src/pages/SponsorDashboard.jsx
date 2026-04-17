import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import SponsorAnalytics from './SponsorAnalytics';
import SponsorOfferingsManager from './SponsorOfferingsManager';
import SponsorshipDetail from './SponsorshipDetail';
import './SponsorDashboard.css';

const SponsorDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [editingProfile, setEditingProfile] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [profileForm, setProfileForm] = useState({
    name: '',
    description: '',
    website: '',
    contactPhone: '',
    logo: null,
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
      // 🔽 SORT: newest requests first (by createdAt descending)
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
        logo: null,
        socialLinks: sponsor.socialLinks || { linkedin: '', twitter: '', facebook: '', instagram: '' },
        contacts: sponsor.contacts || [],
      });
      const ratingData = await apiRequest(`/api/ratings/average/${sponsor._id}/Sponsor`);
      setAvgRating(ratingData.avgRating);
    } catch (err) {
      toast.error('Failed to load profile');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Organization name is required');
      return;
    }
    const cleanPhone = profileForm.contactPhone.replace(/\D/g, '');
    if (cleanPhone && !/^\d{10}$/.test(cleanPhone)) {
      toast.error('Phone number must be 10 digits');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', profileForm.name);
      formData.append('description', profileForm.description);
      formData.append('website', profileForm.website);
      formData.append('contactPhone', cleanPhone);
      formData.append('socialLinks', JSON.stringify(profileForm.socialLinks));
      formData.append('contacts', JSON.stringify(profileForm.contacts));
      if (profileForm.logo) formData.append('logo', profileForm.logo);

      await apiRequest('/api/sponsors/profile', { 
        method: 'PUT', 
        body: formData,
        headers: {}
      });
      
      toast.success('Profile updated successfully!');
      setEditingProfile(false);
      fetchProfile();
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.message || 'Failed to update profile');
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
              <div className="profile-view">
                <div className="profile-avatar">
                  {profile?.logo ? (
                    <img src={`http://localhost:5000/${profile.logo}`} alt={profile.name} />
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
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <h3>Edit Company Profile</h3>
                <div className="form-group">
                  <label>Organization Name *</label>
                  <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={profileForm.description} onChange={e => setProfileForm({ ...profileForm, description: e.target.value })} rows="4" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Website</label>
                    <input type="url" value={profileForm.website} onChange={e => setProfileForm({ ...profileForm, website: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" value={profileForm.contactPhone} onChange={e => setProfileForm({ ...profileForm, contactPhone: e.target.value.replace(/\D/g, '') })} placeholder="10 digits" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Social Links</label>
                  <div className="form-row">
                    <input type="url" placeholder="LinkedIn" value={profileForm.socialLinks.linkedin} onChange={e => setProfileForm({ ...profileForm, socialLinks: { ...profileForm.socialLinks, linkedin: e.target.value } })} />
                    <input type="url" placeholder="Twitter" value={profileForm.socialLinks.twitter} onChange={e => setProfileForm({ ...profileForm, socialLinks: { ...profileForm.socialLinks, twitter: e.target.value } })} />
                  </div>
                  <div className="form-row">
                    <input type="url" placeholder="Facebook" value={profileForm.socialLinks.facebook} onChange={e => setProfileForm({ ...profileForm, socialLinks: { ...profileForm.socialLinks, facebook: e.target.value } })} />
                    <input type="url" placeholder="Instagram" value={profileForm.socialLinks.instagram} onChange={e => setProfileForm({ ...profileForm, socialLinks: { ...profileForm.socialLinks, instagram: e.target.value } })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Contact Persons</label>
                  {profileForm.contacts.map((c, idx) => (
                    <div key={idx} className="contact-item">
                      <span><strong>{c.name}</strong> {c.role && `(${c.role})`} – {c.email} {c.phone && `| ${c.phone}`}</span>
                      <button type="button" className="btn-sm" onClick={() => removeContact(idx)}>Remove</button>
                    </div>
                  ))}
                  <div className="add-contact">
                    <input type="text" placeholder="Name *" value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} />
                    <input type="email" placeholder="Email *" value={newContact.email} onChange={e => setNewContact({ ...newContact, email: e.target.value })} />
                    <input type="text" placeholder="Phone" value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} />
                    <input type="text" placeholder="Role" value={newContact.role} onChange={e => setNewContact({ ...newContact, role: e.target.value })} />
                    <button type="button" className="btn-sm" onClick={addContact}>+ Add</button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Company Logo</label>
                  <input type="file" accept="image/*" onChange={e => setProfileForm({ ...profileForm, logo: e.target.files[0] })} />
                  <small>Recommended: Square image, max 2MB</small>
                </div>
                <div className="actions">
                  <button type="submit" className="btn-primary">💾 Save Changes</button>
                  <button type="button" className="btn-secondary" onClick={() => setEditingProfile(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'analytics' && <SponsorAnalytics />}
        {activeTab === 'offerings' && <SponsorOfferingsManager />}
      </div>
    </div>
  );
};

export default SponsorDashboard;