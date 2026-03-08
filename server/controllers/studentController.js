import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import Student from "../models/Student.js";

export async function registerStudent(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

  const { name, nic, contact, address, regNo, password } = req.body;

  const existing = await Student.findOne({ $or: [{ nic }, { regNo }] });
  if (existing) {
    return res.status(409).json({ message: "Student already exists (NIC or RegNo already used)" });
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

  console.log("BODY:", req.body);
}