import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/api';
import toast from 'react-hot-toast';
import './DetailedProposalForm.css';

const DetailedProposalForm = ({ sponsor, event: propEvent, onClose, onSuccess }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(propEvent?._id || '');
  const [packagesList, setPackagesList] = useState([]);
  const [formData, setFormData] = useState({
    introduction: '',
    eventPurpose: '',
    benefits: [{ title: '', description: '' }],
    packages: [{ name: '', amount: '', benefits: '' }],
    callToAction: '',
    contact: {
      name: '',
      phone: '',
      email: '',
      socialLinks: { linkedin: '', twitter: '', facebook: '' }
    }
  });
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const sections = ['intro', 'purpose', 'benefits', 'packages', 'cta', 'contact'];

  useEffect(() => {
    if (!propEvent) fetchEvents();
    fetchPackages();
  }, [propEvent]);

  const fetchEvents = async () => {
    try {
      const data = await apiRequest('/api/events');
      setEvents(data);
    } catch (err) {
      toast.error('Failed to load events');
    }
  };

  const fetchPackages = async () => {
    try {
      const data = await apiRequest('/api/packages');
      setPackagesList(data);
    } catch (err) {
      console.error('Failed to load packages', err);
    }
  };

  const handleChange = (section, field, value, index = null) => {
    if (section === 'benefits' && index !== null) {
      const newBenefits = [...formData.benefits];
      newBenefits[index][field] = value;
      setFormData({ ...formData, benefits: newBenefits });
    } else if (section === 'packages' && index !== null) {
      const newPackages = [...formData.packages];
      newPackages[index][field] = value;
      setFormData({ ...formData, packages: newPackages });
    } else if (section === 'contact') {
      if (field === 'socialLinks') {
        setFormData({
          ...formData,
          contact: { ...formData.contact, socialLinks: { ...formData.contact.socialLinks, ...value } }
        });
      } else {
        setFormData({ ...formData, contact: { ...formData.contact, [field]: value } });
      }
    } else {
      setFormData({ ...formData, [section]: value });
    }
  };

  const addBenefit = () => setFormData({ ...formData, benefits: [...formData.benefits, { title: '', description: '' }] });
  const removeBenefit = (idx) => setFormData({ ...formData, benefits: formData.benefits.filter((_, i) => i !== idx) });
  const addPackage = () => setFormData({ ...formData, packages: [...formData.packages, { name: '', amount: '', benefits: '' }] });
  const removePackage = (idx) => setFormData({ ...formData, packages: formData.packages.filter((_, i) => i !== idx) });

  const handlePackageSelect = (pkgId) => {
    if (!pkgId) return;
    const selected = packagesList.find(p => p._id === pkgId);
    if (selected) {
      const newPackage = {
        name: selected.name,
        amount: selected.price,
        benefits: selected.benefits?.join('\n') || ''
      };
      setFormData({
        ...formData,
        packages: [...formData.packages, newPackage]
      });
    }
  };

  const validateForm = () => {
    if (!selectedEvent && !propEvent) {
      toast.error('Please select an event');
      return false;
    }
    if (!formData.introduction.trim()) {
      toast.error('Introduction is required');
      return false;
    }
    if (!formData.eventPurpose.trim()) {
      toast.error('Event purpose is required');
      return false;
    }
    if (!formData.benefits.some(b => b.title.trim())) {
      toast.error('Please add at least one benefit with a title');
      return false;
    }
    const validPackage = formData.packages.some(p => p.name.trim() && p.amount > 0);
    if (!validPackage) {
      toast.error('Please add at least one sponsorship package with name and amount');
      return false;
    }
    if (!formData.callToAction.trim()) {
      toast.error('Call to action is required');
      return false;
    }
    if (!formData.contact.name.trim() || !formData.contact.email.trim()) {
      toast.error('Contact name and email are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        eventId: propEvent?._id || selectedEvent,
        sponsorId: sponsor._id,
        proposal: {
          introduction: formData.introduction,
          eventPurpose: formData.eventPurpose,
          benefits: formData.benefits.filter(b => b.title.trim()),
          packages: formData.packages.filter(p => p.name.trim() && p.amount > 0).map(p => ({
            name: p.name,
            amount: parseFloat(p.amount),
            benefits: p.benefits
          })),
          callToAction: formData.callToAction,
          contact: {
            name: formData.contact.name,
            phone: formData.contact.phone,
            email: formData.contact.email,
            socialLinks: {
              linkedin: formData.contact.socialLinks.linkedin,
              twitter: formData.contact.socialLinks.twitter,
              facebook: formData.contact.socialLinks.facebook
            }
          }
        }
      };
      await apiRequest('/api/sponsorship-requests/detailed', { method: 'POST', body: payload });
      toast.success('Proposal sent successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextSection = () => setCurrentSection(prev => Math.min(prev + 1, sections.length - 1));
  const prevSection = () => setCurrentSection(prev => Math.max(prev - 1, 0));

  return (
    <div className="modal-overlay">
      <div className="modal detailed-proposal-modal">
        <div className="modal-header">
          <h2>✨ Send Sponsorship Proposal</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="progress-steps">
          {sections.map((sec, idx) => (
            <div key={sec} className={`step ${idx === currentSection ? 'active' : ''} ${idx < currentSection ? 'completed' : ''}`}>
              <div className="step-number">{idx + 1}</div>
              <div className="step-label">
                {sec === 'intro' && 'INTRO'}
                {sec === 'purpose' && 'PURPOSE'}
                {sec === 'benefits' && 'BENEFITS'}
                {sec === 'packages' && 'PACKAGES'}
                {sec === 'cta' && 'CTA'}
                {sec === 'contact' && 'CONTACT'}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="detailed-form">
          {!propEvent && currentSection === 0 && (
            <div className="form-section">
              <h3>📅 Select Your Event</h3>
              <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} required>
                <option value="">Choose an event</option>
                {events.map(ev => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title} – {new Date(ev.date).toLocaleDateString()} @ {ev.location}
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentSection === 0 && (
            <div className="form-section">
              <h3>📖 1. Introduction (Who we are)</h3>
              <textarea
                placeholder="e.g., We are the organizing committee of XYZ Campus Event..."
                value={formData.introduction}
                onChange={(e) => handleChange('introduction', null, e.target.value)}
                rows="4"
                required
              />
            </div>
          )}

          {currentSection === 1 && (
            <div className="form-section">
              <h3>💡 2. Event Purpose / Theme</h3>
              <textarea
                placeholder="What is the goal of this event? How will it benefit students/community?"
                value={formData.eventPurpose}
                onChange={(e) => handleChange('eventPurpose', null, e.target.value)}
                rows="4"
                required
              />
            </div>
          )}

          {currentSection === 2 && (
            <div className="form-section">
              <h3>🎁 3. Sponsor Benefits</h3>
              {formData.benefits.map((benefit, idx) => (
                <div key={idx} className="benefit-item">
                  <input placeholder="Benefit Title (e.g., Logo on Banner)" value={benefit.title} onChange={(e) => handleChange('benefits', 'title', e.target.value, idx)} required />
                  <textarea placeholder="Description" value={benefit.description} onChange={(e) => handleChange('benefits', 'description', e.target.value, idx)} rows="2" />
                  {formData.benefits.length > 1 && <button type="button" onClick={() => removeBenefit(idx)}>✖</button>}
                </div>
              ))}
              <button type="button" onClick={addBenefit}>+ Add Benefit</button>
            </div>
          )}

          {currentSection === 3 && (
            <div className="form-section">
              <h3>💰 4. Sponsorship Packages</h3>
              <div className="package-selector">
                <label>Add a predefined package:</label>
                <select onChange={(e) => handlePackageSelect(e.target.value)} value="">
                  <option value="">-- Select a package --</option>
                  {packagesList.map(pkg => (
                    <option key={pkg._id} value={pkg._id}>
                      {pkg.name} - ${pkg.price}
                    </option>
                  ))}
                </select>
              </div>
              {formData.packages.map((pkg, idx) => (
                <div key={idx} className="package-item">
                  <input placeholder="Package Name (e.g., Gold)" value={pkg.name} onChange={(e) => handleChange('packages', 'name', e.target.value, idx)} required />
                  <input type="number" placeholder="Amount (USD)" value={pkg.amount} onChange={(e) => handleChange('packages', 'amount', e.target.value, idx)} required />
                  <textarea placeholder="What's included (e.g., Logo on banner, social media post, stall space)" value={pkg.benefits} onChange={(e) => handleChange('packages', 'benefits', e.target.value, idx)} rows="2" />
                  {formData.packages.length > 1 && <button type="button" onClick={() => removePackage(idx)}>✖</button>}
                </div>
              ))}
              <button type="button" onClick={addPackage}>+ Add Custom Package</button>
            </div>
          )}

          {currentSection === 4 && (
            <div className="form-section">
              <h3>📢 5. Call to Action</h3>
              <textarea
                placeholder="e.g., We would love to discuss this partnership further..."
                value={formData.callToAction}
                onChange={(e) => handleChange('callToAction', null, e.target.value)}
                rows="3"
                required
              />
            </div>
          )}

          {currentSection === 5 && (
            <div className="form-section">
              <h3>📞 6. Contact Information</h3>
              <div className="form-row">
                <input placeholder="Name *" value={formData.contact.name} onChange={(e) => handleChange('contact', 'name', e.target.value)} required />
                <input placeholder="Phone" value={formData.contact.phone} onChange={(e) => handleChange('contact', 'phone', e.target.value)} />
              </div>
              <input placeholder="Email *" type="email" value={formData.contact.email} onChange={(e) => handleChange('contact', 'email', e.target.value)} required />
              <div className="form-row">
                <input placeholder="LinkedIn URL" value={formData.contact.socialLinks.linkedin} onChange={(e) => handleChange('contact', 'socialLinks', { linkedin: e.target.value })} />
                <input placeholder="Twitter URL" value={formData.contact.socialLinks.twitter} onChange={(e) => handleChange('contact', 'socialLinks', { twitter: e.target.value })} />
                <input placeholder="Facebook URL" value={formData.contact.socialLinks.facebook} onChange={(e) => handleChange('contact', 'socialLinks', { facebook: e.target.value })} />
              </div>
            </div>
          )}

          <div className="form-navigation">
            {currentSection > 0 && (
              <button type="button" className="btn-secondary" onClick={prevSection}>← Previous</button>
            )}
            {currentSection < sections.length - 1 ? (
              <button type="button" className="btn-primary" onClick={nextSection}>Next →</button>
            ) : (
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Proposal ✨'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DetailedProposalForm;