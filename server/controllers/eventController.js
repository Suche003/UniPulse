// controllers/eventController.js
import Event from "../models/Event.js";

// *CREATE EVENT
export const createEvent = async (req, res) => {
  try {
    // Destructure form data
    let { eventid, title, description, date, location, ispaid, ticketPrice } = req.body;

    // Convert string to boolean
    const isPaidBool = ispaid === "true" || ispaid === true;

    // AUTO-GENERATE eventid if not provided
    if (!eventid) {
      eventid = "EVT" + Date.now(); // e.g., EVT1699999999999
    }

    // Check if eventid already exists
    const existingEvent = await Event.findOne({ eventid });
    if (existingEvent) {
      return res
        .status(400)
        .json({ message: "Event ID already exists. Please use a unique ID." });
    }

    // Create new event object
    const newEvent = new Event({
      eventid,
      title,
      description,
      date,
      location,
      imageUrl: req.file ? req.file.path : "",
      ispaid: isPaidBool,
      ticketPrice: isPaidBool ? ticketPrice : 0,
    });

    // Save to DB
    await newEvent.save();

    // Return success response
    res.status(201).json(newEvent);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// *GET ALL EVENTS
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

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