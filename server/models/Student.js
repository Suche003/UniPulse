import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
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

    regNo: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: [/^[A-Za-z]{2}\d{8}$/, "RegNo must be 2 letters + 8 digits"],
    },

    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);