import express from "express";
import { createBookingStall, getAllBookingStalls, getApprovedBookingStalls, updateBookingStatus, getVendorBookings, getClubEventBookings } from "../controllers/bookingStallController.js";

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

// GET bookings for events created by a club (pass club email as query param)
router.get("/club", getClubEventBookings);

export default router;