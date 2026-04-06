import React, { useState } from 'react';
import { apiRequest } from '../api/api';
import toast from 'react-hot-toast';
import './SponsorshipDetail.css';

const SponsorshipDetail = ({ request, onRefresh, userRole }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('proposal');
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [instructions, setInstructions] = useState(request.paymentInstructions || {});
  const [paymentAmount, setPaymentAmount] = useState(request.agreedPackage?.amount || request.proposedAmount || '');
  const [transactionId, setTransactionId] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [showMeetingScheduleForm, setShowMeetingScheduleForm] = useState(false);
  const [meetingSchedule, setMeetingSchedule] = useState({
    date: '',
    time: '',
    location: '',
    notes: ''
  });

  // ==================== Helper Functions ====================
  const handleResponse = async (action, amount = null, meetingDetails = null) => {
    setActionLoading(true);
    try {
      const body = { action };
      if (amount) body.amount = amount;
      if (meetingDetails) body.meetingDetails = meetingDetails;
      await apiRequest(`/api/sponsorship-requests/${request._id}/respond`, {
        method: 'PATCH',
        body,
      });
      toast.success(`Request ${action}d`);
      onRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptProposal = async () => {
    const selectedPackage = request.proposal?.packages?.[0] || { name: 'Custom', amount: request.proposedAmount };
    const materialsNeeded = {
      logo: confirm('Need company logo?') || false,
      brandGuidelines: confirm('Need brand guidelines?') || false,
      adArtwork: confirm('Need advertisement artwork?') || false,
      socialLinks: confirm('Need social media links?') || false,
      promoVideo: confirm('Need promo video?') || false,
    };
    setActionLoading(true);
    try {
      await apiRequest(`/api/sponsorship-requests/${request._id}/accept-proposal`, {
        method: 'PATCH',
        body: { selectedPackage, paymentDeadline: null, materialsNeeded }
      });
      toast.success('Proposal accepted! Coordination started.');
      onRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = async (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('requestId', request._id);
      formData.append('type', type);
      formData.append('file', file);
      setActionLoading(true);
      try {
        await apiRequest(`/api/sponsorship-requests/${request._id}/upload`, {
          method: 'POST',
          body: formData,
          headers: {},
        });
        toast.success('File uploaded');
        onRefresh();
      } catch (err) {
        toast.error(err.message);
      } finally {
        setActionLoading(false);
      }
    };
    input.click();
  };

  const updateCoordination = async (type, data) => {
    setActionLoading(true);
    try {
      await apiRequest(`/api/sponsorship-requests/${request._id}/coordination`, {
        method: 'PATCH',
        body: { type, data }
      });
      toast.success('Updated');
      onRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveInstructions = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await apiRequest(`/api/sponsorship-requests/${request._id}/payment-instructions`, {
        method: 'PATCH',
        body: instructions
      });
      toast.success('Payment instructions saved');
      setEditingInstructions(false);
      onRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClubResponse = async (action, schedule = null) => {
    setActionLoading(true);
    try {
      const body = { action };
      if (schedule) body.meetingSchedule = schedule;
      await apiRequest(`/api/sponsorship-requests/${request._id}/club-respond`, {
        method: 'PATCH',
        body,
      });
      toast.success(`Meeting ${action === 'accept_meeting' ? 'accepted and scheduled' : 'declined'}`);
      setShowMeetingScheduleForm(false);
      onRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkMeetingCompleted = async () => {
    setActionLoading(true);
    try {
      await apiRequest(`/api/sponsorship-requests/${request._id}/meeting-completed`, {
        method: 'PATCH',
        body: { meetingCompleted: true }
      });
      toast.success('Meeting marked as completed');
      onRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setActionLoading(true);
    try {
      await apiRequest(`/api/sponsorship-requests/${request._id}/record-payment`, {
        method: 'POST',
        body: { amount: parseFloat(paymentAmount), transactionId, notes: paymentNotes }
      });
      toast.success('Payment recorded successfully');
      onRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== Render Proposal ====================
  const renderProposal = () => {
    if (!request.proposal) {
      return (
        <div className="proposal-details">
          <div className="section">
            <h4>Event</h4>
            <p><strong>{request.event?.title || 'Event'}</strong></p>
            <p>Proposed Amount: ${request.proposedAmount}</p>
          </div>
          {request.status === 'pending' && (
            <div className="actions">
              <button className="btn-sm btn-sm-success" onClick={() => handleResponse('accept')} disabled={actionLoading}>Accept</button>
              <button className="btn-sm btn-sm-danger" onClick={() => handleResponse('decline')} disabled={actionLoading}>Decline</button>
              <button className="btn-sm" onClick={() => { const amt = prompt('Counter amount:'); if(amt) handleResponse('counter', parseFloat(amt)); }} disabled={actionLoading}>Counter</button>
              <button className="btn-sm" onClick={() => { const details = prompt('Meeting details:'); if(details) handleResponse('meeting', null, details); }} disabled={actionLoading}>Request Meeting</button>
            </div>
          )}
          {request.status === 'pending' && !request.agreementSigned && (
            <div className="actions">
              <button className="btn-primary" onClick={handleAcceptProposal} disabled={actionLoading}>Start Coordination</button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="proposal-details">
        <div className="section"><h4>Introduction</h4><p>{request.proposal.introduction}</p></div>
        <div className="section"><h4>Event Purpose</h4><p>{request.proposal.eventPurpose}</p></div>
        <div className="section"><h4>Benefits</h4>{request.proposal.benefits?.map((b,i)=><div key={i}><strong>{b.title}</strong>: {b.description}</div>)}</div>
        <div className="section"><h4>Packages</h4>{request.proposal.packages?.map((p,i)=><div key={i}><strong>{p.name}</strong> – ${p.amount}<br/>{p.benefits}</div>)}</div>
        <div className="section"><h4>Call to Action</h4><p>{request.proposal.callToAction}</p></div>
        <div className="section"><h4>Contact</h4><p>{request.proposal.contact?.name} | {request.proposal.contact?.email}</p></div>
        {request.status === 'pending' && (
          <div className="actions">
            <button className="btn-sm btn-sm-success" onClick={() => handleResponse('accept')} disabled={actionLoading}>Accept</button>
            <button className="btn-sm btn-sm-danger" onClick={() => handleResponse('decline')} disabled={actionLoading}>Decline</button>
            <button className="btn-sm" onClick={() => { const amt = prompt('Counter amount:'); if(amt) handleResponse('counter', parseFloat(amt)); }} disabled={actionLoading}>Counter</button>
            <button className="btn-sm" onClick={() => { const details = prompt('Meeting details:'); if(details) handleResponse('meeting', null, details); }} disabled={actionLoading}>Request Meeting</button>
            {/* Show "Accept Proposal & Start Coordination" only when pending and proposal exists */}
            <button className="btn-primary" onClick={handleAcceptProposal} disabled={actionLoading}>Accept Proposal & Start Coordination</button>
          </div>
        )}
      </div>
    );
  };

  // ==================== Coordination Tab (Role‑based) ====================
  const renderCoordination = () => {
    if (userRole === 'sponsor') {
      const canPay = (request.status === 'accepted' || request.status === 'meeting_scheduled') && request.paymentStatus !== 'paid';
      return (
        <div className="coordination">
          {/* Display scheduled meeting if exists */}
          {request.meetingSchedule && request.meetingSchedule.date && (
            <div className="section">
              <h4>📅 Scheduled Meeting</h4>
              <p><strong>Date:</strong> {new Date(request.meetingSchedule.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {request.meetingSchedule.time}</p>
              <p><strong>Location:</strong> {request.meetingSchedule.location}</p>
              {request.meetingSchedule.notes && <p><strong>Notes:</strong> {request.meetingSchedule.notes}</p>}
            </div>
          )}

          <div className="section">
            <h4>📦 Materials Needed</h4>
            {request.materials ? (
              <ul>
                {request.materials.logo && <li>Logo: {request.materialsSubmitted?.logo ? <span>✓ Submitted <a href={`http://localhost:5000${request.materialsSubmitted.logo}`} target="_blank">View</a></span> : <button className="btn-sm" onClick={() => handleFileUpload('logo')} disabled={actionLoading}>Upload Logo</button>}</li>}
                {request.materials.brandGuidelines && <li>Brand Guidelines: {request.materialsSubmitted?.brandGuidelines ? '✓ Submitted' : <button className="btn-sm" onClick={() => handleFileUpload('brandGuidelines')}>Upload</button>}</li>}
                {request.materials.adArtwork && <li>Ad Artwork: {request.materialsSubmitted?.adArtwork ? '✓ Submitted' : <button className="btn-sm" onClick={() => handleFileUpload('adArtwork')}>Upload</button>}</li>}
                {request.materials.socialLinks && <li>Social Links: <button className="btn-sm" onClick={() => updateCoordination('materials', { socialLinks: prompt('Enter social media links:') })}>Update</button></li>}
                {request.materials.promoVideo && <li>Promo Video: {request.materialsSubmitted?.promoVideo ? '✓ Submitted' : <button className="btn-sm" onClick={() => handleFileUpload('promoVideo')}>Upload</button>}</li>}
              </ul>
            ) : <p>No materials requested.</p>}
          </div>

          <div className="section">
            <h4>💳 Payment Information</h4>
            <div>
              {request.paymentInstructions?.bankName && <p><strong>Bank:</strong> {request.paymentInstructions.bankName}</p>}
              {request.paymentInstructions?.accountName && <p><strong>Account Name:</strong> {request.paymentInstructions.accountName}</p>}
              {request.paymentInstructions?.accountNumber && <p><strong>Account Number:</strong> {request.paymentInstructions.accountNumber}</p>}
              {request.paymentInstructions?.deadline && <p><strong>Payment Deadline:</strong> {new Date(request.paymentInstructions.deadline).toLocaleDateString()}</p>}
              {request.paymentInstructions?.otherDetails && <p><strong>Other Details:</strong> {request.paymentInstructions.otherDetails}</p>}
              {(!request.paymentInstructions || Object.keys(request.paymentInstructions).length === 0) && <p>Club has not provided payment instructions yet.</p>}
            </div>
          </div>

          {canPay && (
            <div className="section">
              <h4>💰 Record Payment (Manual)</h4>
              <div className="field">
                <label>Amount ($)</label>
                <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
              </div>
              <div className="field">
                <label>Transaction ID</label>
                <input value={transactionId} onChange={e => setTransactionId(e.target.value)} />
              </div>
              <div className="field">
                <label>Notes (optional)</label>
                <textarea value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} rows="2" />
              </div>
              <button className="btn-primary" onClick={handleRecordPayment} disabled={actionLoading}>
                Mark as Paid
              </button>
            </div>
          )}

          <div className="section"><h4>📢 Promotion Plan</h4><p>{request.promotionPlan ? JSON.stringify(request.promotionPlan) : 'Not yet filled by club'}</p></div>
          <div className="section"><h4>📅 Event Day Checklist</h4><p>{request.eventDayChecklist ? JSON.stringify(request.eventDayChecklist) : 'Not yet filled'}</p></div>
          <div className="section"><h4>📸 Post‑Event Report</h4><p>{request.postEventReport ? JSON.stringify(request.postEventReport) : 'After event'}</p></div>
        </div>
      );
    }

    // Club view
    return (
      <div className="coordination">
        {request.status === 'meeting_requested' && (
          <div className="section">
            <h4>📅 Meeting Request from Sponsor</h4>
            <p><strong>Details:</strong> {request.meetingDetails}</p>
            {!showMeetingScheduleForm ? (
              <div className="actions">
                <button className="btn-sm btn-sm-success" onClick={() => setShowMeetingScheduleForm(true)} disabled={actionLoading}>Accept & Schedule</button>
                <button className="btn-sm btn-sm-danger" onClick={() => handleClubResponse('decline_meeting')} disabled={actionLoading}>Decline</button>
              </div>
            ) : (
              <div className="meeting-schedule-form">
                <h5>Set Meeting Schedule</h5>
                <input type="date" placeholder="Date" value={meetingSchedule.date} onChange={e => setMeetingSchedule({...meetingSchedule, date: e.target.value})} />
                <input type="time" placeholder="Time" value={meetingSchedule.time} onChange={e => setMeetingSchedule({...meetingSchedule, time: e.target.value})} />
                <input placeholder="Location (e.g., Zoom, Room 101)" value={meetingSchedule.location} onChange={e => setMeetingSchedule({...meetingSchedule, location: e.target.value})} />
                <textarea placeholder="Additional notes" value={meetingSchedule.notes} onChange={e => setMeetingSchedule({...meetingSchedule, notes: e.target.value})} rows="2" />
                <div className="actions">
                  <button className="btn-sm btn-sm-success" onClick={() => handleClubResponse('accept_meeting', meetingSchedule)} disabled={actionLoading}>Confirm Schedule</button>
                  <button className="btn-sm" onClick={() => setShowMeetingScheduleForm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {request.meetingSchedule && request.meetingSchedule.date && (
          <div className="section">
            <h4>📅 Scheduled Meeting</h4>
            <p><strong>Date:</strong> {new Date(request.meetingSchedule.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {request.meetingSchedule.time}</p>
            <p><strong>Location:</strong> {request.meetingSchedule.location}</p>
            {request.meetingSchedule.notes && <p><strong>Notes:</strong> {request.meetingSchedule.notes}</p>}
            {!request.meetingCompleted && (
              <div className="actions">
                <button className="btn-sm btn-sm-success" onClick={handleMarkMeetingCompleted} disabled={actionLoading}>Mark Meeting as Completed</button>
              </div>
            )}
            {request.meetingCompleted && <p>✅ Meeting completed</p>}
          </div>
        )}

        <div className="section">
          <h4>💳 Payment Information (Provide bank details for sponsor)</h4>
          {editingInstructions ? (
            <form onSubmit={handleSaveInstructions}>
              <input placeholder="Bank Name" value={instructions.bankName || ''} onChange={e => setInstructions({...instructions, bankName: e.target.value})} />
              <input placeholder="Account Name" value={instructions.accountName || ''} onChange={e => setInstructions({...instructions, accountName: e.target.value})} />
              <input placeholder="Account Number" value={instructions.accountNumber || ''} onChange={e => setInstructions({...instructions, accountNumber: e.target.value})} />
              <input type="date" placeholder="Payment Deadline" value={instructions.deadline?.slice(0,10) || ''} onChange={e => setInstructions({...instructions, deadline: e.target.value})} />
              <textarea placeholder="Other Details" value={instructions.otherDetails || ''} onChange={e => setInstructions({...instructions, otherDetails: e.target.value})} rows="2" />
              <div className="actions">
                <button type="submit" className="btn-sm btn-sm-success" disabled={actionLoading}>Save</button>
                <button type="button" className="btn-sm" onClick={() => setEditingInstructions(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div>
              {request.paymentInstructions?.bankName && <p><strong>Bank:</strong> {request.paymentInstructions.bankName}</p>}
              {request.paymentInstructions?.accountName && <p><strong>Account Name:</strong> {request.paymentInstructions.accountName}</p>}
              {request.paymentInstructions?.accountNumber && <p><strong>Account Number:</strong> {request.paymentInstructions.accountNumber}</p>}
              {request.paymentInstructions?.deadline && <p><strong>Payment Deadline:</strong> {new Date(request.paymentInstructions.deadline).toLocaleDateString()}</p>}
              {request.paymentInstructions?.otherDetails && <p><strong>Other Details:</strong> {request.paymentInstructions.otherDetails}</p>}
              {(!request.paymentInstructions || Object.keys(request.paymentInstructions).length === 0) && <p>No payment instructions provided yet.</p>}
              <button className="btn-sm" onClick={() => setEditingInstructions(true)}>Edit Instructions</button>
            </div>
          )}
        </div>

        <div className="section"><h4>📢 Promotion Plan</h4><p>{request.promotionPlan ? JSON.stringify(request.promotionPlan) : 'Not yet filled'}</p></div>
        <div className="section"><h4>📅 Event Day Checklist</h4><p>{request.eventDayChecklist ? JSON.stringify(request.eventDayChecklist) : 'Not yet filled'}</p></div>
        <div className="section"><h4>📸 Post‑Event Report</h4><p>{request.postEventReport ? JSON.stringify(request.postEventReport) : 'After event'}</p></div>
      </div>
    );
  };

  return (
    <div className="sponsorship-detail-card">
      <div className="card-header">
        <h3>{request.event?.title || 'Event'}</h3>
        <span className={`badge status-${request.status}`}>{request.status}</span>
      </div>
      <div className="detail-tabs">
        <button className={activeTab === 'proposal' ? 'active' : ''} onClick={() => setActiveTab('proposal')}>Proposal</button>
        {(request.status === 'accepted' || request.status === 'meeting_scheduled' || request.status === 'meeting_requested') && (
          <button className={activeTab === 'coordination' ? 'active' : ''} onClick={() => setActiveTab('coordination')}>Coordination</button>
        )}
      </div>
      <div className="tab-content">
        {activeTab === 'proposal' && renderProposal()}
        {activeTab === 'coordination' && renderCoordination()}
      </div>
    </div>
  );
};

export default SponsorshipDetail;