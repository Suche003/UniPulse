import BookingStall from "../models/BookingStall.js";
import Stall from "../models/Stall.js";
import Event from "../models/Event.js";
import Club from "../models/Club.js";

// Helper to generate bookingId like 001, 002
const generateBookingId = async () => {
  const lastBooking = await BookingStall.findOne().sort({ createdAt: -1 });
  if (!lastBooking) return "001";
  const nextId = parseInt(lastBooking.bookingId, 10) + 1;
  return nextId.toString().padStart(3, "0");
};

// Create a new booking 
export const createBookingStall = async (req, res) => {
  try {
    const { eventid, stallId, phone, type } = req.body;

    if (!eventid || !stallId || !phone || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const email = req.user?.email || req.body.email;
    if (!email) return res.status(400).json({ message: "Vendor email is required" });

    const event = await Event.findOne({ eventid });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const stall = await Stall.findOne({ stallId, eventid });
    if (!stall) return res.status(404).json({ message: "Stall not found" });

    const bookingId = await generateBookingId();

    const newBooking = new BookingStall({
      bookingId,
      clubid: event.clubid,  
      eventid,
      title: event.title,
      stallId,
      category: stall.category,
      email,
      phone,
      type,
      status: "pending",
    });

    const savedBooking = await newBooking.save();
    return res.status(201).json(savedBooking);
  } catch (err) {
    console.error("Failed to create booking:", err);
    res.status(500).json({ message: "Failed to create booking", error: err.message });
  }
};

// Get all bookings (admin/testing)
export const getAllBookingStalls = async (req, res) => {
  try {
    const bookings = await BookingStall.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bookings", error: err.message });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: "Status is required" });

    const booking = await BookingStall.findOne({ bookingId: id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (status === "booked") {
      const stall = await Stall.findOne({ eventid: booking.eventid, stallId: booking.stallId });
      if (!stall) return res.status(404).json({ message: "Stall not found" });

      if (stall.availableStalls <= 0) {
        return res.status(400).json({ message: "No stalls available to book" });
      }

      stall.availableStalls -= 1;
      await stall.save();

      booking.status = "booked";
      const updatedBooking = await booking.save();

      return res.json({
        message: "Booking status updated to booked and stall count reduced",
        updatedBooking,
        availableStalls: stall.availableStalls,
      });
    }

    booking.status = status;
    const updatedBooking = await booking.save();
    res.json({ message: `Booking status updated to ${status}`, updatedBooking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update booking status", error: err.message });
  }
};

// Get approved/booked bookings
export const getApprovedBookingStalls = async (req, res) => {
  try {
    const vendorEmail = req.query.email?.trim().toLowerCase(); 
    if (!vendorEmail) return res.status(400).json({ message: "Vendor email is required" });

    const bookings = await BookingStall.find({
      email: { $regex: `^${vendorEmail}$`, $options: "i" },
      status: { $in: ["approved", "booked"] }
    }).sort({ createdAt: -1 });

    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        const event = await Event.findOne({ eventid: booking.eventid });
        const stall = await Stall.findOne({ eventid: booking.eventid, stallId: booking.stallId });

        return {
          ...booking.toObject(),
          eventTitle: event?.title || "Event Name",
          eventDate: event?.date || null,
          price: stall?.price || 0,
        };
      })
    );

    res.json(bookingsWithDetails);
  } catch (err) {
    console.error("Failed to fetch approved bookings:", err);
    res.status(500).json({ message: "Failed to fetch approved bookings", error: err.message });
  }
};

// Get all bookings for a vendor (pending, approved, rejected, booked)
export const getVendorBookings = async (req, res) => {
  try {
    const vendorEmail = req.query.email;

    if (!vendorEmail) {
      return res.status(400).json({ message: "Vendor email is required" });
    }

    const email = vendorEmail.trim().toLowerCase();

    const bookings = await BookingStall.find({
      email: { $regex: `^${email}$`, $options: "i" }
    }).sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Failed to fetch vendor bookings:", err);
    res.status(500).json({
      message: "Failed to fetch vendor bookings",
      error: err.message
    });
  }
};

// Get bookings for a specific club 
export const getClubEventBookings = async (req, res) => {
  try {
    const { clubid } = req.query; 
    if (!clubid) return res.status(400).json({ message: "Club ID is required" });

    let club = null;

    // Check if clubid is a valid Mongo ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(clubid)) {
      club = await Club.findById(clubid);
    }

    // Fallback: search by club code
    if (!club) {
      club = await Club.findOne({ clubid }); 
    }

    if (!club) return res.status(404).json({ message: "Club not found" });

    const bookings = await BookingStall.find({ clubid: club._id }).sort({ createdAt: -1 });

    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        const event = await Event.findOne({ eventid: booking.eventid });
        const stall = await Stall.findOne({ eventid: booking.eventid, stallId: booking.stallId });

        return {
          ...booking.toObject(),
          eventTitle: event?.title || "Event Name",
          eventDate: event?.date || null,
          price: stall?.price || 0,
        };
      })
    );

    res.json(bookingsWithDetails);
  } catch (err) {
    console.error("Failed to fetch club bookings:", err);
    res.status(500).json({ message: "Failed to fetch club bookings", error: err.message });
  }
};