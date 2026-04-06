import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  sponsorshipRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'SponsorshipRequest', required: true },
  sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sponsor', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'pending' },
  transactionId: { type: String, trim: true },
  notes: { type: String, trim: true },
  paidAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
