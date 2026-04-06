import { Router } from "express";
import { body } from "express-validator";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/studentProfileController.js";

const router = Router();

router.get("/me", requireAuth, requireRole("student"), getMyProfile);

router.put(
  "/me",
  requireAuth,
  requireRole("student"),
  [
    body("contact")
      .optional()
      .matches(/^\d{10}$/)
      .withMessage("Contact number must be 10 digits"),
    body("address")
      .optional()
      .notEmpty()
      .withMessage("Address cannot be empty"),
  ],
  updateMyProfile
);

export default router;