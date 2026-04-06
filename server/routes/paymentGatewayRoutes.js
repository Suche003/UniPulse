import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { createCheckoutSession, handleStripeWebhook } from '../controllers/paymentGatewayController.js';

const router = express.Router();

// Sponsor initiates payment
router.post('/create-checkout-session/:requestId', requireAuth, requireRole('sponsor'), createCheckoutSession);

// Stripe webhook (no authentication, raw body needed)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;