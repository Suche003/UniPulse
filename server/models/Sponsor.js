import mongoose from 'mongoose';

const sponsorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: { type: String, default: '' },
  description: { type: String, trim: true, default: '' },
  website: { type: String, trim: true, default: '' },
  contactEmail: { type: String, required: true, trim: true, unique: true },
  contactPhone: { type: String, trim: true, default: '' },
  level: { type: String, enum: ['Platinum', 'Gold', 'Silver', 'Bronze', 'Other'], default: 'Other' },
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'partial'], default: 'unpaid' },
  amountPaid: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'sponsor' },
  // Enhanced profile fields with defaults
  socialLinks: {
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' }
  },
  contacts: { type: Array, default: [] },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Sponsor', sponsorSchema);