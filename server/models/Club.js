import mongoose from "mongoose";

const clubSchema = new mongoose.Schema(
  {
    clubName: { type: String, required: true, trim: true },
    clubId: { type: String, required: true, trim: true, unique: true }, // e.g., CS001
    email: { type: String, required: true, trim: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "club" }, // fixed
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Club", clubSchema);