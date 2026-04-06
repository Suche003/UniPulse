import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    setStallId("V003");
    setCategory("Food");
    setPrice(6000);
    setLocation("Ground Floor");
    setAvailable(6);
    setImage("https://i.postimg.cc/851J3ypB/indian-street-food-stall.jpg");
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
    <div className="stall-container">
      <h2>{eventTitle} Event Stall </h2>
      <form className="stall-form" onSubmit={(e) => e.preventDefault()}>

        {/* Stall ID */}
        <div className="form-group">
          <input
            type="text"
            value={stallId}
            placeholder=" "
            onChange={(e) => handleChange("stallId", e.target.value)}
            onBlur={() => handleBlur("stallId")}
          />
          <label>Stall ID*</label>
          {touched.stallId && errors.stallId && <div className="error">{errors.stallId}</div>}
        </div>

        {/* Category */}
        <div className={`form-group select-group ${category ? "has-value" : ""}`}>
          <select
            value={category}
            onChange={(e) => handleChange("category", e.target.value)}
            onBlur={() => handleBlur("category")}
          >
            <option value="" ></option>
            <option value="Food">Food</option>
            <option value="Merchandise">Merchandise</option>
            <option value="Games">Games</option>
            <option value="Service">Service</option>
            <option value="Other">Other</option>
          </select>
          <label>Category*</label>
          {touched.category && errors.category && <div className="error">{errors.category}</div>}
        </div>

        {/* Price */}
        <div className="form-group">
          <input
            type="number"
            value={price}
            placeholder=" "
            onChange={(e) => handleChange("price", e.target.value)}
            onBlur={() => handleBlur("price")}
          />
          <label>Price (Rs.)*</label>
          {touched.price && errors.price && <div className="error">{errors.price}</div>}
        </div>

        {/* Location */}
        <div className="form-group">
          <input
            type="text"
            value={location}
            placeholder=" "
            onChange={(e) => handleChange("location", e.target.value)}
            onBlur={() => handleBlur("location")}
          />
          <label>Location*</label>
          {touched.location && errors.location && <div className="error">{errors.location}</div>}
        </div>

        {/* Available Stalls */}
        <div className="form-group">
          <input
            type="number"
            value={available}
            placeholder=" "
            onChange={(e) => handleChange("available", e.target.value)}
            onBlur={() => handleBlur("available")}
          />
          <label>Available Stalls*</label>
          {touched.available && errors.available && <div className="error">{errors.available}</div>}
        </div>

        {/* Image URL */}
        <div className="form-group">
          <input
            type="text"
            value={image}
            placeholder=" "
            onChange={(e) => handleChange("image", e.target.value)}
          />
          <label>Image URL</label>
        </div>

        {/* Description */}
        <div className="form-group">
          <textarea
            value={description}
            placeholder=" "
            onChange={(e) => handleChange("description", e.target.value)}
            onBlur={() => handleBlur("description")}
            rows={3}
          />
          <label>Description</label>
          {touched.description && errors.description && <div className="error">{errors.description}</div>}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" className="demo-btn" onClick={fillDemoData}>
            Demo
          </button>

          <button type="button" className="create-btn" onClick={handleCreateStall}>
            Create
          </button>
        </div>
      </form>
    </div>
  );
}