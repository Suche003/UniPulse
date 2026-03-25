import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import Vendor from '../models/Vendor.js';
import Sponsor from '../models/Sponsor.js';

const router = express.Router();

router.get('/dashboard', requireAuth, requireRole('superadmin'), async (req, res) => {
  try {
    const vendors = await Vendor.countDocuments();
    const sponsors = await Sponsor.countDocuments();
    const pendingVendors = await Vendor.countDocuments({ status: 'pending' });
    const pendingSponsors = await Sponsor.countDocuments({ status: 'pending' });
    res.json({ vendors, sponsors, pendingVendors, pendingSponsors });
  } catch (err) {
    console.error('Error in /dashboard:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/stats', requireAuth, requireRole('superadmin'), async (req, res) => {
  try {
    const vendors = await Vendor.countDocuments();
    const sponsors = await Sponsor.countDocuments();
    const pendingVendors = await Vendor.countDocuments({ status: 'pending' });
    const pendingSponsors = await Sponsor.countDocuments({ status: 'pending' });
    
    const vendorRevenue = await Vendor.aggregate([{ $group: { _id: null, total: { $sum: '$amountPaid' } } }]);
    const sponsorRevenue = await Sponsor.aggregate([{ $group: { _id: null, total: { $sum: '$amountPaid' } } }]);
    const totalRevenue = (vendorRevenue[0]?.total || 0) + (sponsorRevenue[0]?.total || 0);
    
    res.json({
      vendors,
      sponsors,
      pendingVendors,
      pendingSponsors,
      totalRevenue,
    });
  } catch (err) {
    console.error('Error in /stats:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
