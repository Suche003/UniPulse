import mongoose from 'mongoose';

const sponsorshipPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Platinum', 'Gold', 'Silver', 'Bronze', 'Other']
  },
  description: String,
  price: { type: Number, required: true, default: 0 },
  benefits: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('SponsorshipPackage', sponsorshipPackageSchema);