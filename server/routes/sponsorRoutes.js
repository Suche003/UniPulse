import express from "express";
import {
  createSponsor,
  getSponsors,
  getSponsorById,
  updateSponsor,
  deleteSponsor,
  updateSponsorStatus,
  updateSponsorPayment,
  uploadSponsorLogo,
} from "../controllers/sponsorController.js";
import { registerSponsor } from "../controllers/sponsorAuthController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import Sponsor from "../models/Sponsor.js";

const router = express.Router();

// ==================== Public Routes ====================

// Sponsor self-registration
router.post("/register", registerSponsor);

// Public list of approved sponsors (for clubs & students)
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

// ==================== Protected Routes ====================
router.use(requireAuth);

// Get all sponsors (superadmin)
router.get("/", requireRole("superadmin"), getSponsors);

// Get single sponsor by ID
router.get("/:id", requireRole("superadmin"), getSponsorById);

// ==================== Update own profile (sponsor only) ====================
router.put(
  "/profile",
  requireRole("sponsor"),
  uploadSponsorLogo,
  async (req, res) => {
    try {
      const sponsorId = req.user.sub;
      const updateData = { ...req.body };

      if (updateData.socialLinks && typeof updateData.socialLinks === "string") {
        try {
          updateData.socialLinks = JSON.parse(updateData.socialLinks);
        } catch (e) {
          return res.status(400).json({ message: "Invalid socialLinks format" });
        }
      }

      if (updateData.contacts && typeof updateData.contacts === "string") {
        try {
          updateData.contacts = JSON.parse(updateData.contacts);
        } catch (e) {
          return res.status(400).json({ message: "Invalid contacts format" });
        }
      }

      delete updateData._id;
      delete updateData.passwordHash;
      delete updateData.role;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.__v;

      if (req.file) updateData.logo = req.file.path;

      const sponsor = await Sponsor.findByIdAndUpdate(sponsorId, updateData, {
        new: true,
        runValidators: true,
      }).select("-passwordHash");

      if (!sponsor) {
        return res.status(404).json({ message: "Sponsor not found" });
      }

      return res.json(sponsor);
    } catch (err) {
      console.error("Profile update error:", err);
      return res.status(500).json({ message: err.message });
    }
  }
);

// ==================== Admin-only Routes ====================
router.post("/", requireRole("superadmin"), uploadSponsorLogo, createSponsor);
router.put("/:id", requireRole("superadmin"), uploadSponsorLogo, updateSponsor);
router.delete("/:id", requireRole("superadmin"), deleteSponsor);
router.patch("/:id/status", requireRole("superadmin"), updateSponsorStatus);
router.patch("/:id/payment", requireRole("superadmin"), updateSponsorPayment);

export default router;