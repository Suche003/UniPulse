// routes/eventRoutes.js
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

// Routes
router.post(
  "/",
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  createEvent
);

//get all events
router.get("/all", getAllEvents);



// Get all pending events
router.get("/", getEvents);

// Delete event
router.delete("/:id", deleteEvent);


// Get all pending events
router.get("/pending", getPendingEvents);

// Approve event
router.put("/approve/:id", approveEvent);

// Reject event
router.put("/reject/:id", rejectEvent);

export default router;