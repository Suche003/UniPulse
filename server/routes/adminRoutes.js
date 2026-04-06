import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import Sponsor from '../models/Sponsor.js';
import Payment from '../models/Payment.js';

const router = express.Router();

router.get('/dashboard', requireAuth, requireRole('superadmin'), async (req, res) => {
  try {
    const sponsors = await Sponsor.countDocuments();
    const pendingSponsors = await Sponsor.countDocuments({ status: 'pending' });
    res.json({ sponsors, pendingSponsors });
  } catch (err) {
    console.error('Error in /dashboard:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/stats', requireAuth, requireRole('superadmin'), async (req, res) => {
  try {
    const sponsors = await Sponsor.countDocuments();
    const pendingSponsors = await Sponsor.countDocuments({ status: 'pending' });
    const sponsorRevenue = await Sponsor.aggregate([{ $group: { _id: null, total: { $sum: '$amountPaid' } } }]);
    const totalRevenue = sponsorRevenue[0]?.total || 0;
    res.json({
      sponsors,
      pendingSponsors,
      totalRevenue,
    });
  } catch (err) {
    console.error('Error in /stats:', err);
    res.status(500).json({ message: err.message });
  }
});

// NEW: Revenue and commission for super admin
router.get('/revenue', requireAuth, requireRole('superadmin'), async (req, res) => {
  try {
    const totalPaidResult = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalPaidResult[0]?.total || 0;
    const commissionPercent = parseFloat(process.env.PLATFORM_COMMISSION_PERCENT || 5);
    const platformCommission = totalRevenue * (commissionPercent / 100);
    res.json({
      totalRevenue,
      platformCommission,
      commissionPercent,
    });
  } catch (err) {
    console.error('Error in /revenue:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;