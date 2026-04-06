import bcrypt from 'bcrypt';
import Sponsor from '../models/Sponsor.js';
import SponsorshipPackage from '../models/SponsorshipPackage.js';

export const registerSponsor = async (req, res) => {
  try {
    const { name, email, password, description, website, contactPhone, packageId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await Sponsor.findOne({ contactEmail: email });
    if (existing) {
      return res.status(409).json({ message: 'Sponsor already registered with this email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let totalAmount = 0;
    let level = 'Other';
    if (packageId) {
      const pkg = await SponsorshipPackage.findById(packageId);
      if (pkg) {
        totalAmount = pkg.price;
        level = pkg.name;
      }
    }

    const sponsor = new Sponsor({
      name,
      contactEmail: email,
      passwordHash,
      description,
      website,
      contactPhone,
      level,
      totalAmount,
      status: 'pending',
    });

    await sponsor.save();

    res.status(201).json({
      message: 'Sponsor registered successfully. Awaiting admin approval.',
      sponsor: { id: sponsor._id, name: sponsor.name, email: sponsor.contactEmail }
    });
  } catch (err) {
    console.error('Sponsor registration error:', err);
    res.status(500).json({ message: err.message });
  }
};