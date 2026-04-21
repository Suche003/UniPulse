import { validationResult } from "express-validator";
import Student from "../models/Student.js";

const getStudentIdFromReq = (req) => {
  return req.user?.sub || req.user?.id || req.user?._id || null;
};

export async function getMyProfile(req, res) {
  try {
    const studentId = getStudentIdFromReq(req);

    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const student = await Student.findById(studentId).select("-passwordHash");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json({
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
    return res.status(500).json({
      message: error.message || "Failed to fetch student",
    });
  }
}

export async function updateMyProfile(req, res) {
  try {
    const studentId = getStudentIdFromReq(req);

    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { contact, address } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (typeof contact !== "undefined") {
      student.contact = contact;
    }

    if (typeof address !== "undefined") {
      student.address = address;
    }

    await student.save();

    return res.json({
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
    return res.status(500).json({
      message: error.message || "Failed to update student profile",
    });
  }
}