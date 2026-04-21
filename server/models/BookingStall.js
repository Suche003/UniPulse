import mongoose from "mongoose";

const bookingStallSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    clubid: { type: String, required: true }, 
    eventid: { type: String, required: true },
    title: { type: String, required: true },
    stallId: { type: String, required: true },
    category: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    type: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "booked"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const BookingStall = mongoose.model("BookingStall", bookingStallSchema);
export default BookingStall;