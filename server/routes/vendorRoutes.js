import express from 'express';
import {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  updateVendorStatus,
  updateVendorPayment
} from '../controllers/vendorController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/:id', getVendorById);
router.put('/:id', updateVendor);

router.post('/', requireRole('superadmin'), createVendor);
router.get('/', requireRole('superadmin'), getVendors);
router.delete('/:id', requireRole('superadmin'), deleteVendor);
router.patch('/:id/status', requireRole('superadmin'), updateVendorStatus);
router.patch('/:id/payment', requireRole('superadmin'), updateVendorPayment);

export default router;