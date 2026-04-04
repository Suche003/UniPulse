import mongoose from "mongoose";

const stallPaymentSchema = new mongoose.Schema(
  { 
    eventid: { type: String, required: true }, 
    stallId: { type: String, required: true, immutable: true }, 
    bookingId: { type: String, required: true, unique: true }, 
    price: { type: Number, required: true }, 
    cardHolderName: { type: String, required: true },
    cardType: { type: String, required: true },
    cardNumber: { type: String, required: true },
    expiryDate: { type: String, required: true },
    status: { type: String, enum: ["success", "failed"], default: "failed" },
  },
  { timestamps: true }
);

const StallPayment = mongoose.model("StallPayment", stallPaymentSchema);
export default StallPayment;