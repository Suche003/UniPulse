import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  businessType: { type: String, enum: ['Food', 'Merchandise', 'Services', 'Other'], default: 'Other' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'partial'], default: 'unpaid' },
  participationFee: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  agreementFile: { type: String, default: '' },
  agreementSigned: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  role: { type: String, default: 'vendor' },
}, { timestamps: true });

vendorSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model('Vendor', vendorSchema);