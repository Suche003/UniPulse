import StallPayment from "../models/StallPayment.js";
import BookingStall from "../models/BookingStall.js";
import Stall from "../models/Stall.js";

// Pay for a booking
export const payForStall = async (req, res) => {
  try {
   
    const {
      bookingId, 
      eventid,
      stallId,
      price,
      cardHolderName,
      cardType,
      cardNumber,
      expiryDate,
    } = req.body;

    if (!bookingId || !eventid || !stallId || !price || !cardHolderName || !cardType || !cardNumber || !expiryDate) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Simulate payment success
    const isSuccess = true;

    // Create payment record 
    const payment = await StallPayment.create({
      bookingId, 
      eventid,
      stallId,
      price,
      cardHolderName,
      cardType,
      cardNumber,
      expiryDate,
      status: isSuccess ? "success" : "failed",
    });

    // Reduce available stalls if payment succeeds
    if (isSuccess) {
      const stall = await Stall.findOne({ eventid, stallId }); 
      if (stall && stall.availableStalls > 0) {
        stall.availableStalls -= 1;
        await stall.save();
      }

      // Update Booking status to "booked"
      await BookingStall.findOneAndUpdate({ bookingId }, { status: "booked" });
    }

    return res.status(201).json({
      success: isSuccess,
      payment,
      message: isSuccess ? "Payment successful" : "Payment failed",
    });

  } catch (err) {
    console.error("payForStall error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// List all successful payments
export const listPayments = async (req, res) => {
  try {
    const payments = await StallPayment.find({ status: "success" }).sort({ createdAt: -1 });
    return res.json({ success: true, payments });
  } catch (err) {
    console.error("listPayments error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};