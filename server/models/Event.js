import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventid: { type: String, unique: true, required: true }, // lowercase 'eventid'
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String },
    imageUrl: { type: String },
    ispaid: { type: Boolean, default: false },  // lowercase 'ispaid'
    ticketPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);