import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import Student from "../models/Student.js";

export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed", errors: errors.array() });
  }

  const { regNo, password } = req.body;

  const student = await Student.findOne({ regNo });
  if (!student) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, student.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { sub: student._id.toString(), role: "student" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    message: "Login success",
    token,
    student: { id: student._id, name: student.name, regNo: student.regNo },
  });
}