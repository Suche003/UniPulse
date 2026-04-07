import { Router } from "express";
import { body } from "express-validator";
import {
  registerStudent,
  getAllStudents,
  getStudentById,
  deleteStudent,
} from "../controllers/studentController.js";

const router = Router();

// Get all students
router.get("/", getAllStudents);

// Get one student by id
router.get("/:id", getStudentById);

// Delete student by id
router.delete("/:id", deleteStudent);

// Register student
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),

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

    body("address")
      .trim()
      .notEmpty()
      .withMessage("Address is required"),

    body("regNo")
      .trim()
      .matches(/^[A-Za-z]{2}\d{8}$/)
      .withMessage("RegNo must be 2 letters + 8 digits"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  registerStudent
);

export default router;