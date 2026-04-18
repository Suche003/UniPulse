import express from "express";
import {
  createSponsor,
  getSponsors,
  getSponsorById,
  updateSponsor,
  deleteSponsor,
  updateSponsorStatus,
  updateSponsorPayment,
  getMyProfile,
  updateMyProfile,
  uploadSponsorLogo,
} from "../controllers/sponsorController.js";
import { registerSponsor } from "../controllers/sponsorAuthController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import Sponsor from "../models/Sponsor.js";

const router = express.Router();

// ==================== Public Routes ====================
// Register a new sponsor (public)
router.post("/register", registerSponsor);

// Get all approved sponsors (public – for club marketplace)
router.get("/public", async (req, res) => {
  try {
    const sponsors = await Sponsor.find({ status: "approved", isActive: true })
      .select("-passwordHash -__v")
      .sort({ createdAt: -1 });
    return res.json(sponsors);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ==================== Protected Routes (require authentication) ====================
router.use(requireAuth);

// Get own profile (sponsor only)
router.get("/profile", requireRole("sponsor"), getMyProfile);

// Update own profile (sponsor only) – with logo upload support
router.put(
  "/profile",
  requireRole("sponsor"),
  uploadSponsorLogo,
  updateMyProfile
);

// ==================== Admin-only Routes ====================
// Get all sponsors (admin only) – optional status filter
router.get("/", requireRole("superadmin"), getSponsors);

// Get a single sponsor by ID (admin only)
router.get("/:id", requireRole("superadmin"), getSponsorById);

// Create a new sponsor (admin only)
router.post("/", requireRole("superadmin"), uploadSponsorLogo, createSponsor);

// Update a sponsor (admin only)
router.put("/:id", requireRole("superadmin"), uploadSponsorLogo, updateSponsor);

// Delete a sponsor (admin only)
router.delete("/:id", requireRole("superadmin"), deleteSponsor);

// Update sponsor status (approve/reject) – admin only
router.patch("/:id/status", requireRole("superadmin"), updateSponsorStatus);

// Update sponsor payment information (admin only)
router.patch("/:id/payment", requireRole("superadmin"), updateSponsorPayment);

export default router;