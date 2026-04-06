import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import SponsorshipRequest from '../models/SponsorshipRequest.js';
import Payment from '../models/Payment.js';

const router = express.Router();
router.use(requireAuth);

router.get('/sponsor', requireRole('sponsor'), async (req, res) => {
  try {
    const sponsorId = req.user.sub;

    const requests = await SponsorshipRequest.find({ sponsor: sponsorId });
    const totalRequests = requests.length;
    
    // Count accepted OR meeting_scheduled as "accepted"
    const acceptedRequests = requests.filter(r => 
      r.status === 'accepted' || r.status === 'meeting_scheduled'
    ).length;
    
    const acceptanceRate = totalRequests ? (acceptedRequests / totalRequests * 100).toFixed(1) : 0;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const declinedRequests = requests.filter(r => r.status === 'declined').length;

    const payments = await Payment.find({ sponsor: sponsorId });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalRequests,
      acceptedRequests,
      acceptanceRate,
      totalPaid,
      pendingRequests,
      declinedRequests,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;