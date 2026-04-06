import { Router } from "express";
import { body } from "express-validator";
import {
  registerVendor,
  getAllVendors,
  approveVendor,
  rejectVendor,
  loginVendor,
} from "../controllers/vendorController.js";

const router = Router();

// Vendor registration
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Vendor name is required"),
    body("nic")
      .trim()
      .matches(/^(?:\d{9}[VvXx]|\d{12})$/)
      .withMessage(
        "NIC must be 9 digits + V/X (e.g., 123456789V) or 12 digits (e.g., 200331310064)"
      ),
    body("contact")
      .trim()
      .matches(/^\d{10}$/)
      .withMessage("Contact must be 10 digits"),
    body("address").trim().notEmpty().withMessage("Address is required"),
    body("email").trim().isEmail().withMessage("Email must be valid"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("stallType")
      .trim()
      .notEmpty()
      .isIn(["Food", "Merchandise", "Games", "Services", "Other"]),
  ],
  registerVendor
);

// Vendor login
router.post("/login", loginVendor);

// Admin routes
router.get("/requests", getAllVendors); 
router.patch("/approve/:id", approveVendor);
router.patch("/reject/:id", rejectVendor);

export default router;