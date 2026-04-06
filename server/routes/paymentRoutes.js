import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { recordPayment, getMyPayments, getAllPayments } from '../controllers/paymentController.js';
import Payment from '../models/Payment.js';
import SponsorshipRequest from '../models/SponsorshipRequest.js';

const router = express.Router();

router.use(requireAuth);

// Sponsor: get my payments
router.get('/my-payments', requireRole('sponsor'), getMyPayments);

// Admin: get all payments
router.get('/', requireRole('superadmin'), getAllPayments);

// Admin: record a payment manually (optional)
router.post('/', requireRole('superadmin'), recordPayment);

// Club: get payments received for their events
router.get('/my-club-payments', requireRole('club'), async (req, res) => {
  try {
    const clubId = req.user.sub;
    // Find all sponsorship requests where club = clubId and status is accepted or paid
    const requests = await SponsorshipRequest.find({ 
      club: clubId, 
      status: { $in: ['accepted', 'meeting_scheduled', 'paid'] } 
    }).select('_id');
    const requestIds = requests.map(r => r._id);
    const payments = await Payment.find({ 
      sponsorshipRequest: { $in: requestIds }, 
      status: 'completed' 
    })
      .populate('event', 'title date location')
      .populate('sponsor', 'name contactEmail')
      .sort('-paidAt');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Receipt: returns payment details (accessible to sponsor, club, superadmin)
router.get('/receipt/:paymentId', requireAuth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('event', 'title date location')
      .populate('sponsor', 'name contactEmail');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    
    const user = req.user;
    if (user.role === 'sponsor' && payment.sponsor.toString() !== user.sub) 
      return res.status(403).json({ message: 'Forbidden' });
    if (user.role === 'club') {
      const request = await SponsorshipRequest.findById(payment.sponsorshipRequest);
      if (!request || request.club.toString() !== user.sub) 
        return res.status(403).json({ message: 'Forbidden' });
    }
    if (user.role !== 'superadmin' && user.role !== 'sponsor' && user.role !== 'club') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;