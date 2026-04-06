import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import SponsorOffering from '../models/SponsorOffering.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Public: get active offerings for clubs
router.get('/public', async (req, res) => {
  try {
    const offerings = await SponsorOffering.find({ status: 'active' })
      .populate('sponsor', 'name logo description level');
    res.json(offerings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sponsor: get my offerings
router.get('/my-offerings', requireRole('sponsor'), async (req, res) => {
  try {
    const offerings = await SponsorOffering.find({ sponsor: req.user.sub });
    res.json(offerings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sponsor: create a new offering
router.post('/', requireRole('sponsor'), async (req, res) => {
  try {
    const offering = new SponsorOffering({
      ...req.body,
      sponsor: req.user.sub,
    });
    await offering.save();
    res.status(201).json(offering);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Sponsor: update an offering
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

// Sponsor: delete an offering
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