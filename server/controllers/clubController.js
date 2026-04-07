import Club from "../models/Club.js";
import Counter from "../models/Counter.js";
import bcrypt from "bcrypt";
import Event from "../models/Event.js";

// CREATE CLUB
export const createClub = async (req, res) => {
  try {
    const { clubName, email, password, faculty } = req.body;

    if (!clubName || !email || !password || !faculty) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingClub = await Club.findOne({ email });
    if (existingClub) {
      return res.status(400).json({ message: "Club email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const counter = await Counter.findOneAndUpdate(
      { name: "clubid" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

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
    console.error("createClub error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Duplicate Club ID or Email",
        error: err.keyValue,
      });
    }

    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL CLUBS
export const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find()
      .select("-passwordHash")
      .sort({ clubid: 1 });

    res.status(200).json(clubs);
  } catch (err) {
    console.error("getAllClubs error:", err);
    res.status(500).json({ message: "Failed to fetch clubs" });
  }
};

// OPTIONAL OLD FORMAT RESPONSE
export const ViewAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find().select("-passwordHash");

    res.status(200).json({
      success: true,
      count: clubs.length,
      data: clubs,
    });
  } catch (error) {
    console.error("ViewAllClubs error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching clubs",
      error: error.message,
    });
  }
};

// DELETE CLUB
export const deleteClub = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedClub = await Club.findByIdAndDelete(id);

    if (!deletedClub) {
      return res.status(404).json({ message: "Club not found" });
    }

    res.status(200).json({ message: "Club deleted successfully" });
  } catch (err) {
    console.error("deleteClub error:", err);
    res.status(500).json({ message: "Failed to delete club" });
  }
};

// UPDATE EVENT
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
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

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

    res.status(200).json({
      message: "Event updated successfully",
      event,
    });
  } catch (err) {
    console.error("updateEvent error:", err);
    res.status(500).json({ message: err.message });
  }
};