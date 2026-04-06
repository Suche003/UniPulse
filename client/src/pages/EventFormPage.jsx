import { useState } from "react";
import axios from "axios";
import "./EventForm.css";

export default function EventFormPage() {
  const [formData, setFormData] = useState({
    clubid: "",
    title: "",
    description: "",
    date: "",
    location: "",
    ispaid: false,
    ticketPrice: 0,
    pdf: null,
    image: null,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (!file) return;

      if (name === "pdf" && file.type !== "application/pdf") {
        return alert("Only PDF allowed!");
      }
      if (name === "image" && !file.type.startsWith("image/")) {
        return alert("Only images allowed!");
      }

      setFormData((prev) => ({ ...prev, [name]: file }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.clubid.trim()) return setError("Club ID is required");
    if (!formData.title.trim() || formData.title.length < 3)
      return setError("Title must be at least 3 characters");
    if (!formData.date) return setError("Date is required");
    if (new Date(formData.date) < new Date())
      return setError("Date must be in the future");
    if (formData.ispaid && (!formData.ticketPrice || formData.ticketPrice <= 0))
      return setError("Invalid ticket price");
    if (!formData.pdf) return setError("PDF is required");
    if (formData.pdf.size > 2 * 1024 * 1024)
      return setError("PDF must be less than 2MB");
    if (formData.image && formData.image.size > 3 * 1024 * 1024)
      return setError("Image must be less than 3MB");

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val) data.append(key, val);
      });

      const res = await axios.post(`http://localhost:5000/api/events`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(`Event Created! ID: ${res.data.eventid}`);
      setFormData({
        clubid: "",
        title: "",
        description: "",
        date: "",
        location: "",
        ispaid: false,
        ticketPrice: 0,
        pdf: null,
        image: null,
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Event Request</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form className="event-form" onSubmit={handleSubmit} noValidate>
        <input
          name="clubid"
          placeholder="Club ID"
          value={formData.clubid}
          onChange={handleChange}
        />
        <input
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
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
          />
        )}

        <div className="file-upload">
          <label>Event PDF (required)</label>
          <input
            type="file"
            name="pdf"
            accept="application/pdf"
            onChange={handleChange}
          />
        </div>

        <div className="file-upload">
          <label>Event Image (optional)</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}