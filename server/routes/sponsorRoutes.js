import express from 'express';
import { 
  createSponsor, getSponsors, getSponsorById, updateSponsor, deleteSponsor,
  updateSponsorStatus, updateSponsorPayment, uploadSponsorLogo
} from '../controllers/sponsorController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Public (authenticated) – anyone can view sponsors
router.get('/', getSponsors);
router.get('/:id', getSponsorById);

// Admin only routes
router.post('/', requireRole('superadmin'), uploadSponsorLogo, createSponsor);
router.put('/:id', requireRole('superadmin'), uploadSponsorLogo, updateSponsor);
router.delete('/:id', requireRole('superadmin'), deleteSponsor);
router.patch('/:id/status', requireRole('superadmin'), updateSponsorStatus);
router.patch('/:id/payment', requireRole('superadmin'), updateSponsorPayment);

export default router;
