import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import Student from "../models/Student.js";

// Register student
export async function registerStudent(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, nic, contact, address, regNo, password } = req.body;

    const existing = await Student.findOne({
      $or: [{ nic }, { regNo }],
    });

    if (existing) {
      return res.status(409).json({
        message: "Student already exists (NIC or RegNo already used)",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name,
      nic,
      contact,
      address,
      regNo,
      passwordHash,
    });

    return res.status(201).json({
      message: "Student registered successfully",
      student: {
        id: student._id,
        name: student.name,
        nic: student.nic,
        contact: student.contact,
        address: student.address,
        regNo: student.regNo,
      },
    });
  } catch (error) {
    console.error("Error registering student:", error);
    return res.status(500).json({
      message: "Failed to register student",
    });
  }
}

// Get all students
export async function getAllStudents(req, res) {
  try {
    const students = await Student.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    return res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({
      message: "Failed to fetch students",
    });
  }
}

// Get single student by id (optional but useful)
export async function getStudentById(req, res) {
  try {
    const student = await Student.findById(req.params.id).select("-passwordHash");

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    return res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return res.status(500).json({
      message: "Failed to fetch student",
    });
  }
}

export async function deleteStudent(req, res) {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    return res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    return res.status(500).json({
      message: "Failed to delete student",
    });
  }
}