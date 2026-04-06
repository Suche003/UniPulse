import express from 'express';
import { 
  createSponsor, 
  getSponsors, 
  getSponsorById, 
  updateSponsor, 
  deleteSponsor,
  updateSponsorStatus, 
  updateSponsorPayment, 
  uploadSponsorLogo
} from '../controllers/sponsorController.js';
import { registerSponsor } from '../controllers/sponsorAuthController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import Sponsor from '../models/Sponsor.js';

const router = express.Router();

// ==================== Public Routes ====================
// Sponsor self-registration
router.post('/register', registerSponsor);

// Public list of approved sponsors (for clubs & students)
router.get('/public', async (req, res) => {
  try {
    const sponsors = await Sponsor.find({ status: 'approved', isActive: true })
      .select('-passwordHash -__v');
    res.json(sponsors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== Protected Routes (require authentication) ====================
router.use(requireAuth);

// Get all sponsors (admin only – can be filtered)
router.get('/', requireRole('superadmin'), getSponsors);

// Get single sponsor by ID (any logged-in user)
router.get('/:id', async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id)
      .populate('events', 'title date')
      .select('-passwordHash');
    if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });
    res.json(sponsor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== Update own profile (sponsor only) ====================
router.put('/profile', requireRole('sponsor'), uploadSponsorLogo, async (req, res) => {
  try {
    const sponsorId = req.user.sub;
    const updateData = { ...req.body };

    // Parse JSON fields if they come as strings (from FormData)
    if (updateData.socialLinks && typeof updateData.socialLinks === 'string') {
      try {
        updateData.socialLinks = JSON.parse(updateData.socialLinks);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid socialLinks format' });
      }
    }
    if (updateData.contacts && typeof updateData.contacts === 'string') {
      try {
        updateData.contacts = JSON.parse(updateData.contacts);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid contacts format' });
      }
    }

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.passwordHash;
    delete updateData.role;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.__v;

    if (req.file) updateData.logo = req.file.path;

    const sponsor = await Sponsor.findByIdAndUpdate(sponsorId, updateData, { 
      new: true, 
      runValidators: true 
    }).select('-passwordHash');

    if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });
    res.json(sponsor);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ==================== Admin-only Routes ====================
router.post('/', requireRole('superadmin'), uploadSponsorLogo, createSponsor);
router.put('/:id', requireRole('superadmin'), uploadSponsorLogo, updateSponsor);
router.delete('/:id', requireRole('superadmin'), deleteSponsor);
router.patch('/:id/status', requireRole('superadmin'), updateSponsorStatus);
router.patch('/:id/payment', requireRole('superadmin'), updateSponsorPayment);

export default router;