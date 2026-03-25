import Sponsor from '../models/Sponsor.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads/sponsors');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
export const uploadSponsorLogo = multer({ storage }).single('logo');

export const createSponsor = async (req, res) => {
  try {
    console.log('🔥 createSponsor called');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const { name, description, website, contactEmail, contactPhone, level, events, totalAmount } = req.body;
    const logo = req.file ? req.file.path : '';

    if (!name || !contactEmail) {
      return res.status(400).json({ message: 'Name and contact email are required' });
    }

    const newSponsor = new Sponsor({
      name,
      logo,
      description,
      website,
      contactEmail,
      contactPhone,
      level,
      events: events ? events.split(',').filter(id => id) : [],
      totalAmount: totalAmount || 0,
    });

    await newSponsor.save();
    console.log('✅ Sponsor saved:', newSponsor._id);
    res.status(201).json(newSponsor);
  } catch (error) {
    console.error('❌ Error in createSponsor:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getSponsors = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const sponsors = await Sponsor.find(filter).populate('events', 'title').sort({ createdAt: -1 });
    res.json(sponsors);
  } catch (error) {
    console.error('❌ Error in getSponsors:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getSponsorById = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id).populate('events', 'title');
    if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });
    res.json(sponsor);
  } catch (error) {
    console.error('❌ Error in getSponsorById:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateSponsor = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.logo = req.file.path;
    if (updateData.events) updateData.events = updateData.events.split(',').filter(id => id);

    const sponsor = await Sponsor.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });
    res.json(sponsor);
  } catch (error) {
    console.error('❌ Error in updateSponsor:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.findByIdAndDelete(req.params.id);
    if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });
    if (sponsor.logo) {
      fs.unlink(sponsor.logo, (err) => { if (err) console.error('Error deleting logo file:', err); });
    }
    res.json({ message: 'Sponsor deleted successfully' });
  } catch (error) {
    console.error('❌ Error in deleteSponsor:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateSponsorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const sponsor = await Sponsor.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });
    res.json(sponsor);
  } catch (error) {
    console.error('❌ Error in updateSponsorStatus:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateSponsorPayment = async (req, res) => {
  try {
    const { paymentStatus, amountPaid } = req.body;
    const sponsor = await Sponsor.findByIdAndUpdate(req.params.id, { paymentStatus, amountPaid }, { new: true });
    if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });
    res.json(sponsor);
  } catch (error) {
    console.error('❌ Error in updateSponsorPayment:', error);
    res.status(500).json({ message: error.message });
  }
};