import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Student from "../models/Student.js";
import Club from "../models/Club.js";
import SuperAdmin from "../models/SuperAdmin.js";
import Sponsor from "../models/Sponsor.js";
import Vendor from "../models/Vendor.js";

export async function commonLogin(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "identifier and password are required" });
    }

    // 1) Try Super Admin by username
    const superAdmin = await SuperAdmin.findOne({
      username: identifier,
      isActive: true,
    });

    if (superAdmin) {
      const ok = await bcrypt.compare(password, superAdmin.passwordHash);
      if (!ok) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { sub: superAdmin._id.toString(), role: "superadmin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Login success",
        role: "superadmin",
        redirectTo: "/superadmin/control-panel",
        token,
        user: { id: superAdmin._id, username: superAdmin.username },
      });
    }

    // 2) Try Club by clubId OR email
    const club = await Club.findOne({
      $or: [{ clubid: identifier }, { email: identifier }],
      isActive: true,
    });

    if (club) {
      const ok = await bcrypt.compare(password, club.passwordHash);
      if (!ok) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { sub: club._id.toString(), role: "club" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Login success",
        role: "club",
        redirectTo: "/club/dashboard",
        token,
        user: {
          id: club._id,
          clubid: club.clubid,
          clubName: club.clubName,
          email: club.email,
        },
      });
    }

    // 3) Try Sponsor by email
    const sponsor = await Sponsor.findOne({
      contactEmail: identifier,
      isActive: true,
    });

    if (sponsor) {
      const ok = await bcrypt.compare(password, sponsor.passwordHash);
      if (!ok) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { sub: sponsor._id.toString(), role: "sponsor" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Login success",
        role: "sponsor",
        redirectTo: "/sponsor/dashboard",
        token,
        user: {
          id: sponsor._id,
          name: sponsor.name,
          email: sponsor.contactEmail,
        },
      });
    }

    // 4) Try Student by regNo
    const student = await Student.findOne({ regNo: identifier });

    if (student) {
      const ok = await bcrypt.compare(password, student.passwordHash);
      if (!ok) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { sub: student._id.toString(), role: "student" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Login success",
        role: "student",
        redirectTo: "/student/dashboard",
        token,
        user: {
          id: student._id,
          name: student.name,
          regNo: student.regNo,
        },
      });
    }

    // 5) Try Vendor by email
    const vendorEmail = identifier.trim().toLowerCase();
    const vendor = await Vendor.findOne({ email: vendorEmail });

    if (vendor) {
      if (vendor.status === "pending") {
        return res.status(403).json({ message: "Vendor not approved yet" });
      }

      if (vendor.status === "rejected") {
        return res
          .status(403)
          .json({ message: "Vendor registration rejected" });
      }

      const ok = await bcrypt.compare(password, vendor.passwordHash);
      if (!ok) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      const token = jwt.sign(
        { sub: vendor._id.toString(), role: "vendor" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Login success",
        role: "vendor",
        redirectTo: "/vendor/dashboard",
        token,
        user: {
          id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          stallType: vendor.stallType,
        },
      });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
}