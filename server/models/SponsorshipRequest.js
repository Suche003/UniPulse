import mongoose from 'mongoose';

const sponsorshipRequestSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sponsor', required: true },
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'countered', 'meeting_requested', 'meeting_scheduled', 'agreement_signed'],
    default: 'pending'
  },
  
  // Detailed proposal (sent by club)
  proposal: {
    introduction: String,
    eventPurpose: String,
    benefits: [{ title: String, description: String }],
    packages: [{ name: String, amount: Number, benefits: String }],
    callToAction: String,
    contact: {
      name: String,
      phone: String,
      email: String,
      socialLinks: { linkedin: String, twitter: String, facebook: String }
    }
  },
  
  // Simple negotiation fields
  proposedAmount: Number,
  counterAmount: Number,
  message: String,
  meetingDetails: String,               // sponsor's meeting request message
  
  // Meeting schedule set by club
  meetingSchedule: {
    date: Date,
    time: String,
    location: String,
    notes: String
  },
  meetingCompleted: { type: Boolean, default: false }, // club marks meeting as done
  
  // After acceptance
  agreedPackage: { name: String, amount: Number },
  
  // Payment instructions (club provides)
  paymentInstructions: {
    bankName: String,
    accountName: String,
    accountNumber: String,
    deadline: Date,
    otherDetails: String
  },
  
  paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  paymentDeadline: Date,     // kept for backward compatibility
  
  // Materials and coordination
  materials: {
    logo: Boolean,
    brandGuidelines: Boolean,
    adArtwork: Boolean,
    socialLinks: Boolean,
    promoVideo: Boolean
  },
  materialsSubmitted: { type: Map, of: String },
  
  // Contracts and signatures
  agreementSigned: { type: Boolean, default: false },
  agreementUrl: String,
  contractUrl: String,
  signedBySponsor: { type: Boolean, default: false },
  signedByClub: { type: Boolean, default: false },
  signedAt: Date,
  
  // Coordination plans
  promotionPlan: {
    socialMediaPosts: [{ date: Date, platform: String, content: String, completed: Boolean }],
    banners: [{ location: String, completed: Boolean }],
    announcements: [{ date: Date, description: String, completed: Boolean }]
  },
  eventDayChecklist: {
    stallSetup: { completed: Boolean, notes: String },
    vipPasses: { delivered: Boolean, count: Number },
    brandVisibility: { completed: Boolean, photos: [String] }
  },
  postEventReport: {
    thankYouLetter: { sent: Boolean, date: Date },
    photos: [String],
    videos: [String],
    audienceStats: String,
    exposureReport: String
  }
}, { timestamps: true });

export default mongoose.model('SponsorshipRequest', sponsorshipRequestSchema);