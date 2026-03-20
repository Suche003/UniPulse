import express from "express";
import multer from "multer";
import { createEvent, getEvents } from "../controllers/eventController.js";

const router = express.Router();

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Routes
router.post("/", upload.single("image"), createEvent); // POST /api/events
router.get("/", getEvents);                            // GET /api/events

export default router; // ✅ This is now ES Module default export