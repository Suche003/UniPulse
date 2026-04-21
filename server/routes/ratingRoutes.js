import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import Rating from '../models/Rating.js';
import SponsorshipRequest from '../models/SponsorshipRequest.js';
import mongoose from 'mongoose';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

/**
 * GET /api/ratings/average/:userId/:userModel
 * Public: Get average rating and count for a Club (or any user)
 */
router.get('/average/:userId/:userModel', async (req, res) => {
  try {
    const { userId, userModel } = req.params;
    if (!['Sponsor', 'Club'].includes(userModel)) {
      return res.status(400).json({ message: 'Invalid userModel' });
    }
    const result = await Rating.aggregate([
      { $match: { ratedUser: new mongoose.Types.ObjectId(userId), ratedUserModel: userModel } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    res.json({ avgRating: result[0]?.avgRating || 0, count: result[0]?.count || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/ratings?requestId=xxx
 * Public: Get all ratings for a specific request
 */
router.get('/', async (req, res) => {
  try {
    const { requestId } = req.query;
    if (!requestId) return res.status(400).json({ message: 'requestId required' });
    const ratings = await Rating.find({ requestId });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== PROTECTED ROUTES ====================
router.use(requireAuth);

/**
 * POST /api/ratings
 * Only sponsors can submit a rating (rating a club)
 */
router.post('/', requireRole('sponsor'), async (req, res) => {
  try {
    const { requestId, rating, review } = req.body;
    const sponsorId = req.user.sub;

    if (!requestId || !rating) {
      return res.status(400).json({ message: 'requestId and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const request = await SponsorshipRequest.findById(requestId).populate('event');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Only allow rating if event date has passed
    if (new Date(request.event.date) > new Date()) {
      return res.status(400).json({ message: 'Event not yet finished' });
    }

    // Ensure the sponsor is the one that was part of this request
    if (request.sponsor.toString() !== sponsorId) {
      return res.status(403).json({ message: 'You can only rate clubs you partnered with' });
    }

    // Check if already rated
    const existing = await Rating.findOne({ requestId, ratedBy: sponsorId });
    if (existing) {
      return res.status(400).json({ message: 'You already rated this club' });
    }

    const newRating = new Rating({
      requestId,
      ratedBy: sponsorId,
      ratedByModel: 'Sponsor',
      ratedUser: request.club,
      ratedUserModel: 'Club',
      rating,
      review: review || '',
    });

    await newRating.save();
    res.status(201).json(newRating);
  } catch (err) {
    console.error('Rating submission error:', err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/ratings/my-ratings – for sponsors to see their submitted ratings
 */
router.get('/my-ratings', requireRole('sponsor'), async (req, res) => {
  try {
    const ratings = await Rating.find({ ratedBy: req.user.sub })
      .populate('requestId', 'event')
      .sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;