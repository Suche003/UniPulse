import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import {
  createRequest,
  getSponsorRequests,
  respondToRequest,
  clubRespond,
  uploadContract,
  signContract,
  createDetailedProposal,
  acceptProposal,
  updateCoordination,
  uploadFile,
  getClubRequests,
  recordPayment,
  markMeetingCompleted,
} from '../controllers/sponsorshipController.js';
import SponsorshipRequest from '../models/SponsorshipRequest.js';
import Payment from '../models/Payment.js';
import Sponsor from '../models/Sponsor.js';
import Club from '../models/Club.js';
import { sendEmail } from '../utils/email.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// ==================== Super Admin ====================
// Get all sponsorship requests (superadmin only)
router.get('/', requireRole('superadmin'), async (req, res) => {
  try {
    const requests = await SponsorshipRequest.find()
      .populate('event', 'title date location')
      .populate('sponsor', 'name contactEmail')
      .populate('club', 'clubName email');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== Club Routes ====================
// Create a simple sponsorship request (club)
router.post('/', requireRole('club'), createRequest);

// Create a detailed proposal (club)
router.post('/detailed', requireRole('club'), createDetailedProposal);

// Get all requests made by the logged-in club
router.get('/my-club-requests', requireRole('club'), getClubRequests);

// Cancel a pending request (club)
router.delete('/:requestId', requireRole('club'), async (req, res) => {
  try {
    const request = await SponsorshipRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.club.toString() !== req.user.sub) return res.status(403).json({ message: 'Not your request' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Cannot cancel non-pending request' });
    await request.deleteOne();
    res.json({ message: 'Request cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Club responds to counter offer or meeting request
router.patch('/:requestId/club-respond', requireRole('club'), clubRespond);

// Club provides payment instructions
router.patch('/:requestId/payment-instructions', requireRole('club'), async (req, res) => {
  try {
    const request = await SponsorshipRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.club.toString() !== req.user.sub) return res.status(403).json({ message: 'Not your request' });
    request.paymentInstructions = req.body;
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Club marks meeting as completed
router.patch('/:requestId/meeting-completed', requireRole('club'), markMeetingCompleted);

// ==================== Sponsor Routes ====================
// Get all requests received by the logged-in sponsor
router.get('/my-requests', requireRole('sponsor'), getSponsorRequests);

// Sponsor responds to a request (accept/decline/counter/meeting)
router.patch('/:requestId/respond', requireRole('sponsor'), respondToRequest);

// Sponsor accepts a detailed proposal
router.patch('/:requestId/accept-proposal', requireRole('sponsor'), acceptProposal);

// Sponsor updates coordination details (materials, promotion plan, etc.)
router.patch('/:requestId/coordination', requireRole('sponsor'), updateCoordination);

// Sponsor uploads a file (logo, contract, etc.)
router.post('/:requestId/upload', requireRole('sponsor'), uploadFile);

// Sponsor records a manual payment
router.post('/:requestId/record-payment', requireRole('sponsor'), recordPayment);

// ==================== Contract Management ====================
// Sponsor uploads a contract URL
router.patch('/:requestId/contract', requireRole('sponsor'), uploadContract);

// Either party signs the contract
router.patch('/:requestId/sign', requireAuth, requireRole(['sponsor', 'club']), signContract);

export default router;