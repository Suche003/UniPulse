import Sponsor from "../models/Sponsor.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../../uploads/sponsors");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

export const uploadSponsorLogo = multer({ storage }).single("logo");

// Create sponsor (admin only)
export const createSponsor = async (req, res) => {
  try {
    console.log("🔥 createSponsor called");
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const {
      name,
      description,
      website,
      contactEmail,
      contactPhone,
      level,
      events,
      totalAmount,
    } = req.body;

    const logo = req.file ? req.file.path : "";

    if (!name || !contactEmail) {
      return res
        .status(400)
        .json({ message: "Name and contact email are required" });
    }

    const newSponsor = new Sponsor({
      name,
      logo,
      description,
      website,
      contactEmail,
      contactPhone,
      level,
      events: events ? events.split(",").filter((id) => id) : [],
      totalAmount: totalAmount || 0,
    });

    await newSponsor.save();
    console.log("✅ Sponsor saved:", newSponsor._id);

    return res.status(201).json(newSponsor);
  } catch (error) {
    console.error("❌ Error in createSponsor:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Get all sponsors (admin only, with optional status filter)
export const getSponsors = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const sponsors = await Sponsor.find(filter)
      .populate("events", "title")
      .sort({ createdAt: -1 });

    return res.json(sponsors);
  } catch (error) {
    console.error("❌ Error in getSponsors:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Get sponsor by id (admin only)
export const getSponsorById = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id).populate(
      "events",
      "title date"
    );

    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor not found" });
    }

    return res.json(sponsor);
  } catch (error) {
    console.error("❌ Error in getSponsorById:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Update sponsor (admin only)
export const updateSponsor = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) updateData.logo = req.file.path;
    if (updateData.events) {
      updateData.events = updateData.events.split(",").filter((id) => id);
    }

    const sponsor = await Sponsor.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor not found" });
    }

    return res.json(sponsor);
  } catch (error) {
    console.error("❌ Error in updateSponsor:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete sponsor (admin only)
export const deleteSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.findByIdAndDelete(req.params.id);

    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor not found" });
    }

    if (sponsor.logo) {
      fs.unlink(sponsor.logo, (err) => {
        if (err) console.error("Error deleting logo file:", err);
      });
    }

    return res.json({ message: "Sponsor deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteSponsor:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Update sponsor status (admin only) – this is the critical approval endpoint
export const updateSponsorStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const sponsor = await Sponsor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }   // return updated document
    );

    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor not found" });
    }

    console.log(`✅ Sponsor ${sponsor.name} status updated to ${status}`);
    return res.json(sponsor);
  } catch (error) {
    console.error("❌ Error in updateSponsorStatus:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Update sponsor payment (admin only)
export const updateSponsorPayment = async (req, res) => {
  try {
    const { paymentStatus, amountPaid } = req.body;

    const sponsor = await Sponsor.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, amountPaid },
      { new: true }
    );

    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor not found" });
    }

    return res.json(sponsor);
  } catch (error) {
    console.error("❌ Error in updateSponsorPayment:", error);
    return res.status(500).json({ message: error.message });
  }
};