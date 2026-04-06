import { validationResult } from "express-validator";
import Student from "../models/Student.js";

export async function getMyProfile(req, res) {
  try {
    const student = await Student.findById(req.user.sub).select("-passwordHash");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      id: student._id,
      name: student.name,
      regNo: student.regNo,
      nic: student.nic,
      contact: student.contact,
      address: student.address,
      role: "student",
    });
  } catch (error) {
    console.error("❌ Error in getMyProfile:", error);
    res.status(500).json({ message: error.message });
  }
}

export async function updateMyProfile(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { contact, address } = req.body;

    const student = await Student.findById(req.user.sub);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // only allow these two fields
    if (typeof contact !== "undefined") student.contact = contact;
    if (typeof address !== "undefined") student.address = address;

    await student.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: student._id,
        name: student.name,
        regNo: student.regNo,
        nic: student.nic,
        contact: student.contact,
        address: student.address,
        role: "student",
      },
    });
  } catch (error) {
    console.error("❌ Error in updateMyProfile:", error);
    res.status(500).json({ message: error.message });
  }
}