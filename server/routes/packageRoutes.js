import express from 'express';
import SponsorshipPackage from '../models/SponsorshipPackage.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all active packages (public)
router.get('/', async (req, res) => {
  try {
    const packages = await SponsorshipPackage.find({ isActive: true }).sort({ price: -1 });
    res.json(packages);
  } catch (err) {
    console.error('Error fetching packages:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create new package (admin only)
router.post('/', requireAuth, requireRole('superadmin'), async (req, res) => {
  try {
    const pkg = new SponsorshipPackage(req.body);
    await pkg.save();
    res.status(201).json(pkg);
  } catch (err) {
    console.error('Error creating package:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update package (admin only)
router.put('/:id', requireAuth, requireRole('superadmin'), async (req, res) => {
  try {
    const pkg = await SponsorshipPackage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json(pkg);
  } catch (err) {
    console.error('Error updating package:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete package (admin only)
router.delete('/:id', requireAuth, requireRole('superadmin'), async (req, res) => {
  try {
    const pkg = await SponsorshipPackage.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json({ message: 'Package deleted' });
  } catch (err) {
    console.error('Error deleting package:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;