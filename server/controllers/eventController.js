// controllers/eventController.js
import Event from "../models/Event.js";
import Counter from "../models/Counter.js";

export const createEvent = async (req, res) => {
  try {
    // Auto-increment Event ID
    const counter = await Counter.findOneAndUpdate(
      { name: "eventid" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const eventid = `Evt${String(counter.seq).padStart(3, "0")}`;

    if (!req.files?.pdf || req.files.pdf.length === 0) {
      return res.status(400).json({ message: "PDF is required" });
    }

    const newEvent = new Event({
      eventid,
      clubid: req.body.clubid,
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location,
      ispaid: req.body.ispaid === "true" || req.body.ispaid === true,
      ticketPrice: req.body.ticketPrice,
      pdf: req.files.pdf[0].filename,
      image: req.files?.image ? req.files.image[0].filename : null
    });

    await newEvent.save();
    res.status(201).json(newEvent);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// GET ALL EVENTS
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }); // sorted by date ascending
    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL APPROVE EVENTS
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE EVENT
export const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all pending events
export const getPendingEvents = async (req, res) => {
  try {
    const pendingEvents = await Event.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json(pendingEvents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Approve an event
export const approveEvent = async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Event not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Reject an event
export const rejectEvent = async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Event not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


