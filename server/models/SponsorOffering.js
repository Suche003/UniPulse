import mongoose from 'mongoose';

const sponsorOfferingSchema = new mongoose.Schema({
  sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sponsor', required: true },
  title: { type: String, required: true },
  description: String,
  budgetMin: Number,
  budgetMax: Number,
  eventCategories: [String],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('SponsorOffering', sponsorOfferingSchema);