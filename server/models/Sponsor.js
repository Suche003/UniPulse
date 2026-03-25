import mongoose from 'mongoose';

const sponsorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: { type: String, default: '' },
  description: { type: String, trim: true },
  website: { type: String, trim: true },
  contactEmail: { type: String, required: true, trim: true },
  contactPhone: { type: String, trim: true },
  level: { type: String, enum: ['Platinum', 'Gold', 'Silver', 'Bronze', 'Other'], default: 'Other' },
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'partial'], default: 'unpaid' },
  amountPaid: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Sponsor', sponsorSchema);
