import express from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import {
  getTicketPurchaseData,
  createTicketPurchase,
  getTicketById,
  completeDemoPayment,
  getMyTickets,
} from "../controllers/studentTicketController.js";

const router = express.Router();

router.get(
  "/tickets/purchase/:eventId",
  requireAuth,
  requireRole("student"),
  getTicketPurchaseData
);

router.post(
  "/tickets/purchase/:eventId",
  requireAuth,
  requireRole("student"),
  createTicketPurchase
);

router.get(
  "/tickets/:ticketId",
  requireAuth,
  requireRole("student"),
  getTicketById
);

router.post(
  "/tickets/:ticketId/pay",
  requireAuth,
  requireRole("student"),
  completeDemoPayment
);

router.get(
  "/tickets",
  requireAuth,
  requireRole("student"),
  getMyTickets
);

export default router;