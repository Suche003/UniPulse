import SponsorshipRequest from '../models/SponsorshipRequest.js';
import Event from '../models/Event.js';
import Sponsor from '../models/Sponsor.js';
import Club from '../models/Club.js';
import Notification from '../models/Notification.js'; // ✅ in‑app notifications

// ==================== Basic Request Functions ====================
export const createRequest = async (req, res) => {
  try {
    const { eventId, sponsorId, proposedAmount, message } = req.body;
    const clubId = req.user.sub;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const sponsor = await Sponsor.findById(sponsorId);
    if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });
    if (sponsor.status !== 'approved') return res.status(400).json({ message: 'Sponsor is not approved' });

    const request = new SponsorshipRequest({
      event: eventId,
      sponsor: sponsorId,
      club: clubId,
      proposedAmount,
      message,
      status: 'pending'
    });

    await request.save();

    // ✅ In‑app notification for sponsor
    await Notification.create({
      userId: sponsor._id,
      userModel: 'Sponsor',
      title: 'New Sponsorship Request',
      message: `You have received a sponsorship request for event "${event.title}" with proposed amount $${proposedAmount}.`,
      type: 'info',
      relatedRequestId: request._id
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSponsorRequests = async (req, res) => {
  try {
    const sponsorId = req.user.sub;
    const requests = await SponsorshipRequest.find({ sponsor: sponsorId })
      .populate('event', 'title date location')
      .populate('club', 'clubName email');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const respondToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, amount, meetingDetails } = req.body;
    const sponsorId = req.user.sub;

    const request = await SponsorshipRequest.findById(requestId)
      .populate('event', 'title')
      .populate('club', 'email clubName');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.sponsor.toString() !== sponsorId) return res.status(403).json({ message: 'Not your request' });

    switch (action) {
      case 'accept':
        request.status = 'accepted';
        if (amount) request.counterAmount = amount;
        break;
      case 'decline':
        request.status = 'declined';
        break;
      case 'counter':
        request.status = 'countered';
        request.counterAmount = amount;
        break;
      case 'meeting':
        request.status = 'meeting_requested';
        request.meetingDetails = meetingDetails;
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
    request.respondedBy = 'sponsor';
    await request.save();

    // ✅ In‑app notification for club
    await Notification.create({
      userId: request.club._id,
      userModel: 'Club',
      title: `Sponsorship request ${action}`,
      message: `Your sponsorship request for event "${request.event.title}" has been ${action}${action === 'counter' ? ` with a counter offer of $${amount}` : ''}.`,
      type: action === 'accept' ? 'success' : 'info',
      relatedRequestId: request._id
    });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const clubRespond = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, meetingSchedule } = req.body;
    const clubId = req.user.sub;

    const request = await SponsorshipRequest.findById(requestId)
      .populate('event', 'title')
      .populate('sponsor', 'contactEmail name');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.club.toString() !== clubId) return res.status(403).json({ message: 'Not your request' });

    if (request.status === 'countered' && action === 'accept_counter') {
      request.status = 'accepted';
      request.proposedAmount = request.counterAmount;
    } else if (request.status === 'meeting_requested' && action === 'accept_meeting') {
      request.status = 'meeting_scheduled';
      if (meetingSchedule) {
        request.meetingSchedule = meetingSchedule;
      }
    } else {
      return res.status(400).json({ message: 'Invalid state or action' });
    }
    request.respondedBy = 'club';
    await request.save();

    // ✅ In‑app notification for sponsor
    let notificationMessage = `Your sponsorship request for event "${request.event.title}" has been ${action === 'accept_counter' ? 'accepted after counter' : 'meeting accepted'}.`;
    if (meetingSchedule) {
      notificationMessage += ` Meeting scheduled: ${new Date(meetingSchedule.date).toLocaleDateString()} at ${meetingSchedule.time} - ${meetingSchedule.location}`;
    }
    await Notification.create({
      userId: request.sponsor._id,
      userModel: 'Sponsor',
      title: 'Sponsorship request update',
      message: notificationMessage,
      type: 'success',
      relatedRequestId: request._id
    });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const uploadContract = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { contractUrl } = req.body;
    const sponsorId = req.user.sub;

    const request = await SponsorshipRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.sponsor.toString() !== sponsorId) return res.status(403).json({ message: 'Not your request' });

    request.contractUrl = contractUrl;
    await request.save();

    res.json({ message: 'Contract uploaded', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const signContract = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { role } = req.user;

    const request = await SponsorshipRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (role === 'sponsor') {
      if (request.sponsor.toString() !== req.user.sub) return res.status(403).json({ message: 'Not your request' });
      request.signedBySponsor = true;
    } else if (role === 'club') {
      if (request.club.toString() !== req.user.sub) return res.status(403).json({ message: 'Not your request' });
      request.signedByClub = true;
    } else {
      return res.status(403).json({ message: 'Invalid role' });
    }

    if (request.signedBySponsor && request.signedByClub) {
      request.signedAt = new Date();
    }

    await request.save();
    res.json({ message: 'Contract signed', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== Detailed Proposal Functions ====================
export const createDetailedProposal = async (req, res) => {
  try {
    const { eventId, sponsorId, proposal } = req.body;
    const clubId = req.user.sub;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const sponsor = await Sponsor.findById(sponsorId);
    if (!sponsor || sponsor.status !== 'approved') {
      return res.status(400).json({ message: 'Sponsor not available' });
    }

    const request = new SponsorshipRequest({
      event: eventId,
      sponsor: sponsorId,
      club: clubId,
      proposal,
      status: 'pending',
      proposedAmount: proposal.packages[0]?.amount || 0
    });

    await request.save();

    // ✅ In‑app notification for sponsor
    await Notification.create({
      userId: sponsor._id,
      userModel: 'Sponsor',
      title: 'New Sponsorship Proposal',
      message: `You have received a detailed sponsorship proposal for event "${event.title}". Please check your dashboard.`,
      type: 'info',
      relatedRequestId: request._id
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const acceptProposal = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { selectedPackage, paymentDeadline, materialsNeeded } = req.body;
    const sponsorId = req.user.sub;

    const request = await SponsorshipRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.sponsor.toString() !== sponsorId) return res.status(403).json({ message: 'Not your request' });

    request.status = 'accepted';
    request.agreedPackage = selectedPackage;
    request.paymentDeadline = paymentDeadline;
    request.materials = materialsNeeded;
    await request.save();

    // ✅ In‑app notification for club
    const club = await Club.findById(request.club);
    await Notification.create({
      userId: club._id,
      userModel: 'Club',
      title: 'Proposal Accepted',
      message: `Your sponsorship proposal for event "${request.event.title}" has been accepted. Please coordinate next steps.`,
      type: 'success',
      relatedRequestId: request._id
    });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCoordination = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { type, data } = req.body;
    const userId = req.user.sub;
    const role = req.user.role;

    const request = await SponsorshipRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (role === 'sponsor' && request.sponsor.toString() !== userId) return res.status(403).json({ message: 'Not your request' });
    if (role === 'club' && request.club.toString() !== userId) return res.status(403).json({ message: 'Not your request' });

    switch (type) {
      case 'materials':
        if (!request.materialsSubmitted) request.materialsSubmitted = new Map();
        Object.entries(data).forEach(([key, value]) => {
          request.materialsSubmitted.set(key, value);
        });
        break;
      case 'promotionPlan':
        request.promotionPlan = { ...request.promotionPlan, ...data };
        break;
      case 'eventDay':
        request.eventDayChecklist = { ...request.eventDayChecklist, ...data };
        break;
      case 'postEvent':
        request.postEventReport = { ...request.postEventReport, ...data };
        break;
      default:
        return res.status(400).json({ message: 'Invalid update type' });
    }

    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const uploadFile = async (req, res) => {
  try {
    const { requestId, type } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const request = await SponsorshipRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const userId = req.user.sub;
    const role = req.user.role;
    if (role === 'sponsor' && request.sponsor.toString() !== userId) return res.status(403);
    if (role === 'club' && request.club.toString() !== userId) return res.status(403);

    const fileUrl = `/uploads/${file.filename}`;

    switch (type) {
      case 'logo':
        if (!request.materialsSubmitted) request.materialsSubmitted = new Map();
        request.materialsSubmitted.set('logo', fileUrl);
        break;
      case 'photo':
        if (!request.postEventReport) request.postEventReport = {};
        if (!request.postEventReport.photos) request.postEventReport.photos = [];
        request.postEventReport.photos.push(fileUrl);
        break;
      case 'contract':
        request.agreementUrl = fileUrl;
        break;
      case 'video':
        if (!request.postEventReport) request.postEventReport = {};
        if (!request.postEventReport.videos) request.postEventReport.videos = [];
        request.postEventReport.videos.push(fileUrl);
        break;
      default:
        return res.status(400).json({ message: 'Invalid file type' });
    }

    await request.save();
    res.json({ message: 'File uploaded', url: fileUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};