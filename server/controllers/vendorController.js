import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import Vendor from "../models/Vendor.js";
import jwt from "jsonwebtoken";

// ---------------- Vendor Registration ----------------
export async function registerVendor(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Validation failed", errors: errors.array() });
  }

  const { name, nic, contact, address, email, password, stallType } = req.body;

  try {
    const existing = await Vendor.findOne({ $or: [{ nic }, { email }] });
    if (existing) {
      return res.status(409).json({
        message: "Vendor already exists (NIC or Email already used)",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const vendor = await Vendor.create({
      name,
      nic,
      contact,
      address,
      email: email.trim().toLowerCase(), 
      passwordHash,
      stallType,
      status: "pending",
    });

    return res.status(201).json({
      message: "Vendor request submitted successfully. Waiting for admin approval.",
      vendor: {
        id: vendor._id,
        name: vendor.name,
        nic: vendor.nic,
        contact: vendor.contact,
        address: vendor.address,
        email: vendor.email,
        stallType: vendor.stallType,
        status: vendor.status,
      },
    });
  } catch (err) {
    console.error("Vendor registration error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------------- Vendor Login ----------------
export async function loginVendor(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Validation failed", errors: errors.array() });
  }

  let { email, password } = req.body;
  email = email.trim().toLowerCase(); 

  try {
    // Case-insensitive search for email
    const vendor = await Vendor.findOne({ email });

    // If vendor not found
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not registered" });
    }

    // Check vendor status
    if (vendor.status === "pending") {
      return res.status(403).json({ message: "Vendor not approved yet" });
    } else if (vendor.status === "rejected") {
      return res.status(403).json({ message: "Vendor registration rejected" });
    }

    // Verify password
    const ok = await bcrypt.compare(password, vendor.passwordHash);
    if (!ok) return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { sub: vendor._id.toString(), role: "vendor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login success",
      token,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        stallType: vendor.stallType,
      },
    });
  } catch (err) {
    console.error("Vendor login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------------- Admin: Get All Vendors ----------------
export async function getAllVendors(req, res) {
  try {
    const vendors = await Vendor.find().select("-passwordHash"); 
    res.json(vendors);
  } catch (err) {
    console.error("Get vendors error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------------- Admin: Approve Vendor ----------------
export async function approveVendor(req, res) {
  const { id } = req.params;
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    res.json({ message: "Vendor approved successfully", vendor });
  } catch (err) {
    console.error("Approve vendor error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------------- Admin: Reject Vendor ----------------
export async function rejectVendor(req, res) {
  const { id } = req.params;
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    res.json({ message: "Vendor rejected successfully", vendor });
  } catch (err) {
    console.error("Reject vendor error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}