import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./AddStall.css";

export default function AddStall() {
  const { eventid } = useParams();
  const navigate = useNavigate();

  const [eventTitle, setEventTitle] = useState("");
  const [stallId, setStallId] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [available, setAvailable] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/events");
        const event = res.data.find((e) => e.eventid === eventid);
        setEventTitle(event ? event.title : eventid);
      } catch (err) {
        console.error("Error fetching event:", err);
        setEventTitle(eventid);
      }
    };
    fetchEvent();
  }, [eventid]);

  const fillDemoData = () => {
    setStallId("T003");
    setCategory("Food");
    setPrice(8000);
    setLocation("Ground Floor");
    setAvailable(1);
    setImage("https://i.postimg.cc/rpshHMrd/vibrant-food-stall-stockcake.webp");
    setDescription("Freshly baked snacks.");
  };

  const validateField = (name, value) => {
    let message = "";

    switch (name) {
      case "stallId":
        if (!value) message = "Stall ID required";
        else if (!/^[A-Za-z]\d{3}$/.test(value))
          message = "Stall ID must be 1 letter followed by 3 digits (e.g., A123)";
        break;
      case "category":
        if (!value) message = "Category required";
        break;
      case "price":
        if (!value || value <= 0) message = "Price must be > 0";
        else if (value < 5000) message = "Price must be at least Rs. 5000";
        break;
      case "location":
        if (!value) message = "Location required";
        break;
      case "available":
        if (!value || value <= 0) message = "Available stalls must be > 0";
        break;
      case "description":
        if (value.length > 30)
          message = "Description cannot exceed 30 characters";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
    return message === "";
  };

  const handleChange = (name, value) => {
    switch (name) {
      case "stallId": setStallId(value); break;
      case "category": setCategory(value); break;
      case "price": setPrice(value); break;
      case "location": setLocation(value); break;
      case "available": setAvailable(value); break;
      case "image": setImage(value); break;
      case "description": setDescription(value); break;
      default: break;
    }
    validateField(name, value);
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  useEffect(() => {
    const formValid =
      validateField("stallId", stallId) &&
      validateField("category", category) &&
      validateField("price", price) &&
      validateField("location", location) &&
      validateField("available", available) &&
      validateField("description", description);

    setIsFormValid(formValid);
  }, [stallId, category, price, location, available, description]);

  const handleCreateStall = async () => {
    setTouched({
      stallId: true,
      category: true,
      price: true,
      location: true,
      available: true,
      description: true,
    });

    if (!stallId || !category || !price || !location || !available) {
      alert("Please fill all required fields!");
      return;
    }

    if (!isFormValid) {
      alert("Please fix errors in the form before submitting!");
      return;
    }

    try {
      const newStall = {
        stallId,
        category,
        price: Number(price),
        location,
        availableStalls: Number(available),
        image,
        description,
      };

      await axios.post(`http://localhost:5000/api/stalls/event/${eventid}`, newStall);

      alert("Stall added successfully!");
      navigate(-1);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add stall");
    }
  };

  return (
    <div className="stall-form-page">
  <div className="stall-form-container">
    <div className="stall-form-header">
      <Link to="/club/dashboard" className="stall-form-back-btn">
        ← Back
      </Link>
      <div className="stall-form-hero">
        <h1>{eventTitle} Event Stall</h1>
        <p>
          Add a new stall for your event. Fill in the details below to submit for approval.
        </p>
      </div>
    </div>

    <form className="stall-form-card" onSubmit={(e) => e.preventDefault()}>
      <div className="stall-form-grid">
        {/* Stall ID */}
        <div className="stall-form-group full-width">
          <label>Stall ID*</label>
          <input
            type="text"
            value={stallId}
            placeholder="Enter Stall ID"
            onChange={(e) => handleChange("stallId", e.target.value)}
            onBlur={() => handleBlur("stallId")}
          />
          {touched.stallId && errors.stallId && (
            <div className="error">{errors.stallId}</div>
          )}
        </div>

        {/* Category */}
        <div className="stall-form-group">
          <label>Category*</label>
          <select
            value={category}
            onChange={(e) => handleChange("category", e.target.value)}
            onBlur={() => handleBlur("category")}
          >
            <option value="" disabled hidden>Select Stall Category</option>
            <option value="Food">Food</option>
            <option value="Merchandise">Merchandise</option>
            <option value="Games">Games</option>
            <option value="Service">Service</option>
            <option value="Other">Other</option>
          </select>
          {touched.category && errors.category && (
            <div className="error">{errors.category}</div>
          )}
        </div>

        {/* Price */}
        <div className="stall-form-group">
          <label>Price (Rs.)*</label>
          <input
            type="number"
            value={price}
            placeholder="Enter Price"
            onChange={(e) => handleChange("price", e.target.value)}
            onBlur={() => handleBlur("price")}
          />
          {touched.price && errors.price && (
            <div className="error">{errors.price}</div>
          )}
        </div>

        {/* Location */}
        <div className="stall-form-group">
          <label>Location*</label>
          <input
            type="text"
            value={location}
            placeholder="Enter Location"
            onChange={(e) => handleChange("location", e.target.value)}
            onBlur={() => handleBlur("location")}
          />
          {touched.location && errors.location && (
            <div className="error">{errors.location}</div>
          )}
        </div>

        {/* Available */}
        <div className="stall-form-group">
          <label>Available Stalls*</label>
          <input
            type="number"
            value={available}
            placeholder="Enter Available Stalls"
            onChange={(e) => handleChange("available", e.target.value)}
            onBlur={() => handleBlur("available")}
          />
          {touched.available && errors.available && (
            <div className="error">{errors.available}</div>
          )}
        </div>

        {/* Image */}
        <div className="stall-form-group full-width">
          <label>Image URL</label>
          <input
            type="text"
            value={image}
            placeholder="Enter Image URL"
            onChange={(e) => handleChange("image", e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="stall-form-group full-width">
          <label>Description</label>
          <textarea
            value={description}
            placeholder="Enter Description"
            rows={3}
            onChange={(e) => handleChange("description", e.target.value)}
            onBlur={() => handleBlur("description")}
          />
          {touched.description && errors.description && (
            <div className="error">{errors.description}</div>
          )}
        </div>
      </div>

      <div className="stall-form-actions">
        <button type="button" className="stall-form-secondary-btn" onClick={fillDemoData}>
          Demo
        </button>
        <button type="button" className="stall-form-primary-btn" onClick={handleCreateStall}>
          Create
        </button>
      </div>
    </form>
  </div>
</div>
  );
}