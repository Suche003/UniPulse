import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import "./EventForm.css";

const EventFormPage = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("unipulse_user")) || {};
  const clubid = user?._id || user?.id || user?.clubid || "";

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

  const [loading, setLoading] = useState(false);

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        ticketPrice: name === "ispaid" && !checked ? "" : prev.ticketPrice,
      }));
      return;
    }

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0] || null,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!clubid) {
      toast.error("Club ID not found. Please login again.");
      return false;
    }

    if (!formData.title.trim()) {
      toast.error("Event title is required.");
      return false;
    }

    if (!formData.description.trim()) {
      toast.error("Event description is required.");
      return false;
    }

    if (!formData.date) {
      toast.error("Event date is required.");
      return false;
    }

    if (new Date(formData.date) <= new Date()) {
      toast.error("Please select a future date and time.");
      return false;
    }

    if (!formData.location.trim()) {
      toast.error("Location is required.");
      return false;
    }

    if (!formData.pdf) {
      toast.error("Please upload the event PDF.");
      return false;
    }

    if (formData.ispaid && (!formData.ticketPrice || Number(formData.ticketPrice) < 0)) {
      toast.error("Please enter a valid ticket price.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const submitData = new FormData();
      submitData.append("clubid", clubid);
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("date", formData.date);
      submitData.append("location", formData.location);
      submitData.append("ispaid", formData.ispaid);

      if (formData.ispaid) {
        submitData.append("ticketPrice", formData.ticketPrice);
      }

      if (formData.pdf) {
        submitData.append("pdf", formData.pdf);
      }

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      await axios.post("http://localhost:5000/api/events", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Event request submitted successfully!");

      setFormData({
        title: "",
        description: "",
        date: "",
        location: "",
        ispaid: false,
        ticketPrice: "",
        pdf: null,
        image: null,
      });

      setTimeout(() => {
        navigate("/club/dashboard");
      }, 1200);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(error.response?.data?.message || "Failed to submit event request.");
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
            <h1>Create New Event</h1>
            <p>
              Submit your event details for approval. Once approved, your event
              will appear in the club dashboard and student-facing event areas.
            </p>
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
              />
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
                min={getMinDateTime()}
              />
            </div>

            <div className="event-form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter event location"
              />
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

            <div className="event-form-group">
              <label>Ticket Price</label>
              <input
                type="number"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                placeholder="Enter ticket price"
                min="0"
                disabled={!formData.ispaid}
              />
            </div>

            <div className="event-form-group">
              <label>Upload PDF</label>
              <input
                type="file"
                name="pdf"
                accept=".pdf"
                onChange={handleChange}
              />
              <small>Required file</small>
            </div>

            <div className="event-form-group">
              <label>Upload Event Image</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
              />
              <small>Optional image</small>
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

            <button type="submit" className="event-form-primary-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Event Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormPage;