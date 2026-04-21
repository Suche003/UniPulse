import express from "express";
import {
  createFeedback,
  getEventFeedbacks,
  getMyFeedbackStatus,
  getMyFeedbackByEvent,
  updateMyFeedback,
  deleteMyFeedback,
} from "../controllers/feedbackController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all feedback for one event
router.get("/event/:eventId", getEventFeedbacks);

// Get current student's feedback status
router.get("/me/status", requireAuth, getMyFeedbackStatus);

// Get my feedback for one event
router.get("/me/:eventId", requireAuth, getMyFeedbackByEvent);

// Submit feedback
router.post("/:eventId", requireAuth, createFeedback);

// Update my feedback
router.put("/:eventId", requireAuth, updateMyFeedback);

// Delete my feedback
router.delete("/:eventId", requireAuth, deleteMyFeedback);

export default router;