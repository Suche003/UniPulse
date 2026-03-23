import Stall from "../models/Stall.js";
import Event from "../models/Event.js";

// *CREATE STALL for a specific event
export const createStall = async (req, res) => {
  try {
    const { eventid } = req.params;
    const { type, price, location, availableStalls, image, description } = req.body;

    // Check if event exists
    const event = await Event.findOne({ eventid });
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Create new stall
    const newStall = new Stall({
      eventid,
      type,
      price,
      location,
      availableStalls,
      image,
      description,
    });

    await newStall.save();
    res.status(201).json(newStall);

  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({ message: error.message });
  }
};

// *GET ALL STALLS for an event
export const getStalls = async (req, res) => {
  try {
    const { eventid } = req.params;

    const stalls = await Stall.find({ eventid }).sort({ createdAt: -1 });
    res.json(stalls);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// *GET SINGLE STALL by ID
export const getStallById = async (req, res) => {
  try {
    const { eventid, id } = req.params;

    const stall = await Stall.findOne({ _id: id, eventid });
    if (!stall) {
      return res.status(404).json({ message: "Stall not found." });
    }

    res.json(stall);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// *UPDATE STALL
export const updateStall = async (req, res) => {
  try {
    const { eventid, id } = req.params;
    const { type, price, location, availableStalls, image, description, status } = req.body;

    const updatedData = {
      type,
      price,
      location,
      availableStalls,
      description,
      status,
    };

    // Only update image if provided
    if (image) {
      updatedData.image = image;
    }

    const stall = await Stall.findOneAndUpdate(
      { _id: id, eventid },
      updatedData,
      { new: true, runValidators: true }
    );

    if (!stall) {
      return res.status(404).json({ message: "Stall not found." });
    }

    res.json(stall);

  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({ message: error.message });
  }
};

// *DELETE STALL
export const deleteStall = async (req, res) => {
  try {
    const { eventid, id } = req.params;

    const stall = await Stall.findOneAndDelete({ _id: id, eventid });

    if (!stall) {
      return res.status(404).json({ message: "Stall not found." });
    }

    res.json({ message: "Stall deleted successfully." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};