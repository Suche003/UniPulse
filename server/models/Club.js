import mongoose from "mongoose";

const clubSchema = new mongoose.Schema(
  {
    clubName: { type: String, required: true, trim: true },
    clubid: { type: String,  unique: true },//Auto generated
    faculty: { type: String,  required: true },//Auto generated
    email: { type: String, required: true, trim: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "club" }, // fixed
    isActive: { type: Boolean, default: true },
  },
  
  { timestamps: true }
);


export default mongoose.model("Club", clubSchema);