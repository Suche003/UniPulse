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
} from '../controllers/sponsorshipController.js';
import SponsorshipRequest from '../models/SponsorshipRequest.js';
import Payment from '../models/Payment.js';
import Sponsor from '../models/Sponsor.js';
import Club from '../models/Club.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// ==================== Super Admin ====================
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
router.post('/', requireRole('club'), createRequest);
router.post('/detailed', requireRole('club'), createDetailedProposal);
router.get('/my-club-requests', requireRole('club'), async (req, res) => {
  try {
    const requests = await SponsorshipRequest.find({ club: req.user.sub })
      .populate('event', 'title date location')
      .populate('sponsor', 'name contactEmail');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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

router.patch('/:requestId/club-respond', requireRole('club'), clubRespond);

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

router.patch('/:requestId/meeting-completed', requireRole('club'), async (req, res) => {
  try {
    const request = await SponsorshipRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.club.toString() !== req.user.sub) return res.status(403).json({ message: 'Not your request' });
    request.meetingCompleted = true;
    await request.save();
    res.json({ message: 'Meeting marked as completed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== Sponsor Routes ====================
router.get('/my-requests', requireRole('sponsor'), getSponsorRequests);
router.patch('/:requestId/respond', requireRole('sponsor'), respondToRequest);
router.patch('/:requestId/accept-proposal', requireRole('sponsor'), acceptProposal);
router.patch('/:requestId/coordination', requireRole('sponsor'), updateCoordination);
router.post('/:requestId/upload', requireRole('sponsor'), uploadFile);

// Manual payment recording (sponsor)
router.post('/:requestId/record-payment', requireRole('sponsor'), async (req, res) => {
  try {
    const { amount, transactionId, notes } = req.body;
    const request = await SponsorshipRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.sponsor.toString() !== req.user.sub) return res.status(403).json({ message: 'Not your request' });
    if (request.status !== 'accepted' && request.status !== 'meeting_scheduled') {
      return res.status(400).json({ message: 'Request not accepted or meeting not scheduled' });
    }

    const payment = new Payment({
      sponsorshipRequest: request._id,
      sponsor: request.sponsor,
      event: request.event,
      amount,
      transactionId,
      notes,
      status: 'completed',
      paidAt: new Date()
    });
    await payment.save();

    const sponsor = await Sponsor.findById(request.sponsor);
    const totalPaid = (await Payment.aggregate([
      { $match: { sponsor: sponsor._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]))[0]?.total || 0;
    sponsor.amountPaid = totalPaid;
    sponsor.paymentStatus = totalPaid >= sponsor.totalAmount ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
    await sponsor.save();

    request.paymentStatus = 'paid';
    await request.save();

    // Notify club via email
    const club = await Club.findById(request.club);
    if (club) {
      await sendEmail({
        to: club.email,
        subject: 'Sponsorship Payment Received',
        html: `<p><strong>${sponsor.name}</strong> has paid <strong>$${amount}</strong> for your event "${request.event.title}".</p>
               <p>Transaction ID: ${transactionId || 'N/A'}</p>
               <p>You can view the receipt in your dashboard.</p>`
      });
    }

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== Contract Management ====================
router.patch('/:requestId/contract', requireRole('sponsor'), uploadContract);
router.patch('/:requestId/sign', requireAuth, requireRole(['sponsor', 'club']), signContract);

export default router;