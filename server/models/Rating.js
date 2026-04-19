import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'SponsorshipRequest', required: true },
  ratedBy: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'ratedByModel' },
  ratedByModel: { type: String, enum: ['Sponsor', 'Club'], required: true },
  ratedUser: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'ratedUserModel' },
  ratedUserModel: { type: String, enum: ['Sponsor', 'Club'], required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, trim: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Rating', ratingSchema);