import { useState } from "react";
import axios from "../api/axios"; // Make sure axios.js exists with baseURL

export default function EventFormPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();

    // simple validation
    if (!title.trim() || !date) {
      alert("Please enter title and date");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("location", location);
    if (image) formData.append("image", image);

    try {
      setSubmitting(true);
      const res = await axios.post("/events", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Event created successfully!");
      console.log("Backend response:", res.data);

      // Optional: reset form
      setTitle("");
      setDescription("");
      setDate("");
      setLocation("");
      setImage(null);

    } catch (err) {
      console.error("Error creating event:", err);
      alert("Error creating event. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: "500px", margin: "auto" }}>
      <div>
        <label htmlFor="event-title">Title *</label>
        <input
          id="event-title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter event title"
          required
        />
      </div>

      <div>
        <label htmlFor="event-description">Description</label>
        <textarea
          id="event-description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter event description"
        />
      </div>

      <div>
        <label htmlFor="event-date">Date *</label>
        <input
          id="event-date"
          name="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="event-location">Location</label>
        <input
          id="event-location"
          name="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter event location"
        />
      </div>

      <div>
        <label htmlFor="event-image">Image</label>
        <input
          id="event-image"
          name="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? "Creating..." : "Create Event"}
      </button>
    </form>
  );
}