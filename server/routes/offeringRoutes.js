import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import SponsorOffering from '../models/SponsorOffering.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// Get active offerings for clubs (newest first)
router.get('/public', async (req, res) => {
  try {
    const offerings = await SponsorOffering.find({ status: 'active' })
      .populate('sponsor', 'name logo description level')
      .sort({ createdAt: -1 }); // ✅ newest first
    res.json(offerings);
  } catch (err) {
    console.error('Error fetching public offerings:', err);
    res.status(500).json({ message: err.message });
  }
});

// ==================== PROTECTED ROUTES (require auth) ====================
router.use(requireAuth);

// Get my offerings (sponsor only)
router.get('/my-offerings', requireRole('sponsor'), async (req, res) => {
  try {
    const offerings = await SponsorOffering.find({ sponsor: req.user.sub })
      .sort({ createdAt: -1 });
    res.json(offerings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new offering (sponsor only)
router.post('/', requireRole('sponsor'), async (req, res) => {
  try {
    const offering = new SponsorOffering({
      ...req.body,
      sponsor: req.user.sub,
    });
    await offering.save();
    res.status(201).json(offering);
  } catch (err) {
    console.error('Error creating offering:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update an offering (sponsor only)
router.put('/:id', requireRole('sponsor'), async (req, res) => {
  try {
    const offering = await SponsorOffering.findOne({ _id: req.params.id, sponsor: req.user.sub });
    if (!offering) return res.status(404).json({ message: 'Offering not found' });
    Object.assign(offering, req.body);
    await offering.save();
    res.json(offering);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an offering (sponsor only)
router.delete('/:id', requireRole('sponsor'), async (req, res) => {
  try {
    const offering = await SponsorOffering.findOneAndDelete({ _id: req.params.id, sponsor: req.user.sub });
    if (!offering) return res.status(404).json({ message: 'Offering not found' });
    res.json({ message: 'Offering deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;