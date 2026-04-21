import express from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import {
  getStudentEventDetails,
  markGoing,
  removeGoing,
  requestTicket,
  getMyStudentEvents,
} from "../controllers/studentEventController.js";

const router = express.Router();

router.get("/events/my-events", requireAuth, requireRole("student"), getMyStudentEvents);
router.get("/events/:id", requireAuth, requireRole("student"), getStudentEventDetails);
router.post("/events/:id/go", requireAuth, requireRole("student"), markGoing);
router.delete("/events/:id/go", requireAuth, requireRole("student"), removeGoing);
router.post("/events/:id/buy-ticket", requireAuth, requireRole("student"), requestTicket);

export default router;