import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "superadmin" }, // fixed
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("SuperAdmin", superAdminSchema);