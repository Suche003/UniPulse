import Sponsor from "../models/Sponsor.js";
import Notification from "../models/Notification.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../uploads/sponsors");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, PNG, WEBP) are allowed"));
  }
};

export const uploadSponsorLogo = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
}).single("logo");

// ==================== Admin CRUD ====================

// Create sponsor (admin only)
export const createSponsor = async (req, res) => {
  try {
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
      return res.status(400).json({ message: "Name and contact email are required" });
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
    const sponsor = await Sponsor.findById(req.params.id).populate("events", "title date");
    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });
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

    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });
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
    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });

    if (sponsor.logo && fs.existsSync(sponsor.logo)) {
      fs.unlinkSync(sponsor.logo);
    }
    return res.json({ message: "Sponsor deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteSponsor:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Update sponsor status (approve/reject) – ADMIN only
export const updateSponsorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const sponsor = await Sponsor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });

    // 🔔 Create notification for sponsor
    let title = '';
    let message = '';
    if (status === 'approved') {
      title = 'Sponsor Account Approved';
      message = `Your sponsor account has been approved. You can now log in and start receiving sponsorship requests.`;
    } else if (status === 'rejected') {
      title = 'Sponsor Account Rejected';
      message = `Your sponsor account was rejected. Please contact support for more information.`;
    }
    if (title && message) {
      await Notification.create({
        userId: sponsor._id,
        userModel: 'Sponsor',
        title,
        message,
        type: status === 'approved' ? 'success' : 'error',
      });
    }

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
    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });

    // 🔔 Notify sponsor about payment update
    await Notification.create({
      userId: sponsor._id,
      userModel: 'Sponsor',
      title: 'Payment Information Updated',
      message: `Your payment status has been updated to "${paymentStatus}". Total paid: $${amountPaid || 0}.`,
      type: 'info',
    });

    return res.json(sponsor);
  } catch (error) {
    console.error("❌ Error in updateSponsorPayment:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ==================== Sponsor Profile (self) ====================

// Get own profile
export const getMyProfile = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.user.sub).select("-passwordHash");
    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });
    return res.json(sponsor);
  } catch (error) {
    console.error("❌ Error in getMyProfile:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Update own profile (with logo upload & removal)
export const updateMyProfile = async (req, res) => {
  try {
    const sponsorId = req.user.sub;
    const existingSponsor = await Sponsor.findById(sponsorId);
    if (!existingSponsor) return res.status(404).json({ message: "Sponsor not found" });

    // Parse incoming JSON fields
    let socialLinks = existingSponsor.socialLinks;
    let contacts = existingSponsor.contacts;

    if (req.body.socialLinks) {
      try {
        socialLinks = typeof req.body.socialLinks === "string"
          ? JSON.parse(req.body.socialLinks)
          : req.body.socialLinks;
      } catch (e) {
        return res.status(400).json({ message: "Invalid socialLinks format" });
      }
    }

    if (req.body.contacts) {
      try {
        contacts = typeof req.body.contacts === "string"
          ? JSON.parse(req.body.contacts)
          : req.body.contacts;
      } catch (e) {
        return res.status(400).json({ message: "Invalid contacts format" });
      }
    }

    // Build update object
    const updateData = {
      name: req.body.name || existingSponsor.name,
      description: req.body.description !== undefined ? req.body.description : existingSponsor.description,
      website: req.body.website !== undefined ? req.body.website : existingSponsor.website,
      contactPhone: req.body.contactPhone !== undefined ? req.body.contactPhone : existingSponsor.contactPhone,
      socialLinks,
      contacts,
    };

    // Handle logo upload or removal
    if (req.body.removeLogo === "true") {
      if (existingSponsor.logo && fs.existsSync(existingSponsor.logo)) {
        fs.unlinkSync(existingSponsor.logo);
      }
      updateData.logo = "";
    } else if (req.file) {
      if (existingSponsor.logo && fs.existsSync(existingSponsor.logo)) {
        fs.unlinkSync(existingSponsor.logo);
      }
      updateData.logo = req.file.path;
    }

    const updatedSponsor = await Sponsor.findByIdAndUpdate(sponsorId, updateData, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    return res.json(updatedSponsor);
  } catch (error) {
    console.error("❌ Error in updateMyProfile:", error);
    return res.status(500).json({ message: error.message });
  }
};