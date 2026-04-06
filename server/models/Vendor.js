import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    nic: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: [
        /^(?:\d{9}[VvXx]|\d{12})$/,
        "NIC must be old (9 digits + V/X) or new (12 digits) format",
      ],
    },

    contact: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "Contact must be 10 digits"],
    },

    address: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Email must be a valid email address",
      ],
    },

    passwordHash: { type: String, required: true },

    stallType: {
      type: String,
      required: true,
      enum: ["Food", "Merchandise", "Games", "Services", "Other"],
    },

    
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", vendorSchema);