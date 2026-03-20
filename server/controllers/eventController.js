import Event from "../models/Event.js";

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    const eventData = {
      title,
      description,
      date,
      location,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    };
    const event = await Event.create(eventData);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};