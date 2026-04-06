import express from "express";
import { createBookingStall, getAllBookingStalls, getApprovedBookingStalls, updateBookingStatus, getVendorBookings } from "../controllers/bookingStallController.js";

const router = express.Router();

// POST new booking
router.post("/", createBookingStall);

// GET all bookings
router.get("/", getAllBookingStalls);

// GET approved/booked bookings for a vendor (pass email as query param)
router.get("/approved", getApprovedBookingStalls);

// PATCH booking status
router.patch("/:id/status", updateBookingStatus);

// GET all bookings for a vendor (any status)
router.get("/vendor", getVendorBookings);

export default router;