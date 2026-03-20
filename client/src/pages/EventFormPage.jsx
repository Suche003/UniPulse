import { useState } from "react";
import axios from "axios";
import "./EventForm.css"; // we'll create this CSS file

function EventForm() {
  const [formData, setFormData] = useState({
    eventid: "",
    title: "",
    description: "",
    date: "",
    location: "",
    ispaid: false,
    ticketPrice: 0,
    image: null
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, image: files[0] });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const data = new FormData();
      data.append("eventid", formData.eventid);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("date", formData.date);
      data.append("location", formData.location);
      data.append("ispaid", formData.ispaid);
      if (formData.ispaid) data.append("ticketPrice", formData.ticketPrice);
      if (formData.image) data.append("image", formData.image);

      const res = await axios.post("http://localhost:5000/api/events", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(`Event Created! Event ID: ${res.data.eventid}`);
      setFormData({
        eventid: "",
        title: "",
        description: "",
        date: "",
        location: "",
        ispaid: false,
        ticketPrice: 0,
        image: null
      });

    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Create Event (Admin)</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit} className="event-form">

        <input
          name="eventid"
          placeholder="Event ID"
          value={formData.eventid}
          onChange={handleChange}
          required
        />

        <input
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <input
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="ispaid"
            checked={formData.ispaid}
            onChange={handleChange}
          />
          Paid Event
        </label>

        {formData.ispaid && (
          <input
            type="number"
            name="ticketPrice"
            placeholder="Ticket Price"
            value={formData.ticketPrice}
            onChange={handleChange}
            required
          />
        )}

        <input
          type="file"
          name="image"
          onChange={handleChange}
          accept="image/*"
        />

        <button type="submit">Create Event</button>
      </form>
    </div>
  );
}

export default EventForm;