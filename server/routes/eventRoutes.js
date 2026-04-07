import express from "express";
import multer from "multer";
import {
  createEvent,
  getEvents,
  deleteEvent,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getAllEvents,
  getMyClubEvents,
} from "../controllers/eventController.js";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}`), false);
  }
};

const upload = multer({ storage, fileFilter });

// CREATE EVENT
router.post(
  "/",
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  createEvent
);

// GET ALL EVENTS
router.get("/all", getAllEvents);

// GET EVENTS CREATED BY A SPECIFIC CLUB
router.get("/club/:clubid", getMyClubEvents);

// GET ALL APPROVED EVENTS
router.get("/", getEvents);

// DELETE EVENT
router.delete("/:id", deleteEvent);

// GET ALL PENDING EVENTS
router.get("/pending", getPendingEvents);

// APPROVE EVENT
router.put("/approve/:id", approveEvent);

// REJECT EVENT
router.put("/reject/:id", rejectEvent);

export default router;