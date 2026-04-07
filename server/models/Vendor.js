import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    contact: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "Contact number must be 10 digits"],
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

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

    businessRegistrationNo: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

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