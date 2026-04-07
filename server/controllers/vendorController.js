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

  const {
    companyName,
    contact,
    address,
    email,
    password,
    stallType,
    businessRegistrationNo,
  } = req.body;

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await Vendor.findOne({
      $or: [
        { email: normalizedEmail },
        { businessRegistrationNo: businessRegistrationNo.trim() },
      ],
    });

    if (existing) {
      return res.status(409).json({
        message:
          "Vendor already exists (Business Registration Number or Email already used)",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const vendor = await Vendor.create({
      companyName: companyName.trim(),
      contact: contact.trim(),
      address: address.trim(),
      email: normalizedEmail,
      businessRegistrationNo: businessRegistrationNo.trim(),
      passwordHash,
      stallType: stallType.trim(),
      status: "pending",
    });

    return res.status(201).json({
      message:
        "Vendor request submitted successfully. Waiting for admin approval.",
      vendor: {
        id: vendor._id,
        companyName: vendor.companyName,
        contact: vendor.contact,
        address: vendor.address,
        email: vendor.email,
        businessRegistrationNo: vendor.businessRegistrationNo,
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
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  email = email.trim().toLowerCase();

  try {
    const vendor = await Vendor.findOne({ email });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not registered" });
    }

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
      token,
      vendor: {
        id: vendor._id,
        companyName: vendor.companyName,
        email: vendor.email,
        stallType: vendor.stallType,
        status: vendor.status,
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
    const { status } = req.query;
    const filter = status ? { status } : {};

    const vendors = await Vendor.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    return res.status(200).json(vendors);
  } catch (err) {
    console.error("Get vendors error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------------- Admin: Get Vendor By ID ----------------
export async function getVendorById(req, res) {
  const { id } = req.params;

  try {
    const vendor = await Vendor.findById(id).select("-passwordHash");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    return res.status(200).json(vendor);
  } catch (err) {
    console.error("Get vendor by id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------------- Admin: Delete Vendor ----------------
export async function deleteVendor(req, res) {
  const { id } = req.params;

  try {
    const vendor = await Vendor.findByIdAndDelete(id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    return res.status(200).json({
      message: "Vendor deleted successfully",
    });
  } catch (err) {
    console.error("Delete vendor error:", err);
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
    ).select("-passwordHash");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    return res.json({ message: "Vendor approved successfully", vendor });
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
    ).select("-passwordHash");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    return res.json({ message: "Vendor rejected successfully", vendor });
  } catch (err) {
    console.error("Reject vendor error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}