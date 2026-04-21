import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./EventForm.css";

export default function UpdateEventForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    ispaid: false,
    ticketPrice: "",
    pdf: null,
    image: null,
  });

  const [existingFiles, setExistingFiles] = useState({ pdf: "", image: "" });
  const [loading, setLoading] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Load existing event data
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/events/${id}`)
      .then((res) => {
        const data = res.data.data;
        setFormData({
          title: data.title || "",
          description: data.description || "",
          date: data.date ? data.date.slice(0, 16) : "",
          location: data.location || "",
          ispaid: data.ispaid || false,
          ticketPrice: data.ticketPrice || "",
          pdf: null,
          image: null,
        });
        setExistingFiles({
          pdf: data.pdf || "",
          image: data.image || "",
        });
      })
      .catch(() => alert("Failed to load event"));
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, type, checked, value, files } = e.target;

    if (type === "checkbox") setFormData({ ...formData, [name]: checked });
    else if (type === "file") setFormData({ ...formData, [name]: files[0] });
    else setFormData({ ...formData, [name]: value });
  };

  // Validate form before submit
  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    else if (formData.title.trim().length < 3)
      newErrors.title = "Title must be at least 3 characters";
    else if (!/^[A-Za-z0-9\s]+$/.test(formData.title))
      newErrors.title = "Title can only contain letters, numbers and spaces";

    if (!formData.date) newErrors.date = "Date is required";
    else if (new Date(formData.date) <= new Date())
      newErrors.date = "Event date must be in the future";

    if (!formData.location.trim()) newErrors.location = "Location is required";

    if (formData.ispaid && (formData.ticketPrice === "" || formData.ticketPrice < 0))
      newErrors.ticketPrice = "Ticket price must be 0 or more";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const submitData = new FormData();
    for (let key in formData) {
      if (formData[key] !== null && formData[key] !== "")
        submitData.append(key, formData[key]);
    }

    try {
      await axios.put(
        `http://localhost:5000/api/events/update/${id}`,
        submitData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("Event updated successfully!");
      navigate("/club/dashboard");
    } catch (err) {
      console.error(err);
      alert("Update failed. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-form-page">
      <div className="event-form-container">
        <div className="event-form-header">
          <Link to="/club/dashboard" className="event-form-back-btn">
            ← Back
          </Link>
          <div className="event-form-hero">
            <h1>Update Event</h1>
            <p>Edit your event details below and submit to update.</p>
          </div>
        </div>

        <form className="event-form-card" onSubmit={handleSubmit}>
          <div className="event-form-grid">
            <div className="event-form-group full-width">
              <label>Event Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
                required
              />
              {errors.title && <small className="error">{errors.title}</small>}
            </div>

            <div className="event-form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter event description"
                rows="5"
              />
            </div>

            <div className="event-form-group">
              <label>Date</label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              {errors.date && <small className="error">{errors.date}</small>}
            </div>

            <div className="event-form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter event location"
                required
              />
              {errors.location && <small className="error">{errors.location}</small>}
            </div>

            <div className="event-form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="ispaid"
                  checked={formData.ispaid}
                  onChange={handleChange}
                />
                <span>Paid Event</span>
              </label>
            </div>

            {formData.ispaid && (
              <div className="event-form-group">
                <label>Ticket Price</label>
                <input
                  type="number"
                  name="ticketPrice"
                  value={formData.ticketPrice}
                  onChange={handleChange}
                  placeholder="Enter ticket price"
                  min="0"
                />
                {errors.ticketPrice && (
                  <small className="error">{errors.ticketPrice}</small>
                )}
              </div>
            )}

            <div className="event-form-group">
              <label>Update PDF</label>
              {existingFiles.pdf && (
                <small>Current PDF: {existingFiles.pdf.split("/").pop()}</small>
              )}
              <input type="file" name="pdf" onChange={handleChange} />
            </div>

            <div className="event-form-group">
              <label>Update Image</label>
              {existingFiles.image && (
                <small>Current Image: {existingFiles.image.split("/").pop()}</small>
              )}
              <input type="file" name="image" onChange={handleChange} />
            </div>
          </div>

          <div className="event-form-actions">
            <button
              type="button"
              className="event-form-secondary-btn"
              onClick={() => navigate("/club/dashboard")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="event-form-primary-btn"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}