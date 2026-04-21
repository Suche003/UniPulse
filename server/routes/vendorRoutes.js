import { Router } from "express";
import { body } from "express-validator";
import {
  registerVendor,
  getAllVendors,
  getVendorById,
  deleteVendor,
  approveVendor,
  rejectVendor,
  loginVendor,
  updateVendor
} from "../controllers/vendorController.js";

const router = Router();

//  Vendor Registration 
router.post(
  "/register",
  [
    body("companyName")
      .trim()
      .notEmpty()
      .withMessage("Company name is required"),

    body("contact")
      .trim()
      .matches(/^\d{10}$/)
      .withMessage("Contact number must be 10 digits"),

    body("address")
      .trim()
      .notEmpty()
      .withMessage("Business address is required"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Business email must be valid"),

    body("businessRegistrationNo")
      .trim()
      .notEmpty()
      .withMessage("Business registration number is required"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),

    body("stallType")
      .trim()
      .notEmpty()
      .withMessage("Stall type is required")
      .isIn(["Food", "Merchandise", "Games", "Services", "Other"])
      .withMessage(
        "Stall type must be Food, Merchandise, Games, Services, or Other"
      ),
  ],
  registerVendor
);

//  Vendor Login 
router.post("/login", loginVendor);

//  Admin Request Management 
router.get("/requests", getAllVendors);
router.patch("/approve/:id", approveVendor);
router.patch("/reject/:id", rejectVendor);

//  Vendor List / Single / Delete / Update
router.get("/", getAllVendors);
router.get("/:id", getVendorById);
router.delete("/:id", deleteVendor);
router.put("/:id", updateVendor);

export default router;