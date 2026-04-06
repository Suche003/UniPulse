// controllers/ClubController.js
import Club from "../models/Club.js";
import Counter from "../models/Counter.js";
import bcrypt from "bcrypt";
import Event from "../models/Event.js"; // ✅ Add missing import

// CREATE CLUB (with auto-generated ID)
export const createClub = async (req, res) => {
  try {
    const { clubName, email, password, faculty } = req.body;
    if (!clubName || !email || !password || !faculty) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const counter = await Counter.findOneAndUpdate(
      { name: "clubid" },
      { $inc: { seq: 0} },
      { upsert: true, returnDocument: "after" } // ✅ Correct option
    );

    // ✅ Ensure seq is never undefined
    const clubid = `CLB${String(counter?.seq || 1).padStart(3, "0")}`;

    const club = new Club({
      clubName,
      email,
      passwordHash,
      clubid,
      faculty,
    });

    await club.save();

    res.status(201).json({
      message: "Club created successfully",
      club,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Duplicate Club ID or Email", error: err.keyValue });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find().sort({ clubid: 1 });
    res.status(200).json(clubs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch clubs" });
  }
};

// GET ALL CLUBS
export const ViewAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find().select("-passwordHash");

    res.status(200).json({
      success: true,
      count: clubs.length,
      data: clubs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching clubs",
      error: error.message,
    });
  }
};

// Update Event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clubid,
      title,
      description,
      date,
      location,
      ispaid,
      ticketPrice,
      pdf,
      image,
      status,
    } = req.body;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Update fields (Event ID remains unchanged)
    event.clubid = clubid || event.clubid;
    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.location = location || event.location;
    event.ispaid = ispaid !== undefined ? ispaid : event.ispaid;
    event.ticketPrice = ispaid ? ticketPrice : 0;
    event.pdf = pdf || event.pdf;
    event.image = image || event.image;
    event.status = status || event.status;

    await event.save();
    res.json({ message: "Event updated successfully", event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};