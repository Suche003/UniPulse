import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./EditStall.css";

const EditStall = () => {
  const { eventid, stallId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { stall, eventTitle } = location.state || {};

  const [formData, setFormData] = useState({
    category: "",
    price: "",
    location: "",
    availableStalls: "",
    description: "",
    image: ""
  });

  useEffect(() => {
    if (stall) {
      setFormData({
        category: stall.category || "",
        price: stall.price || "",
        location: stall.location || "",
        availableStalls: stall.availableStalls || "",
        description: stall.description || "",
        image: stall.image || ""
      });
    } else {
      axios.get(`http://localhost:5000/api/stalls/event/${eventid}/${stallId}`)
        .then(res => setFormData(res.data))
        .catch(err => console.error(err));
    }
  }, [stall, eventid, stallId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { category, price, location, availableStalls } = formData;
    if (!category || !price || !location || !availableStalls) {
      return alert("Please fill all required fields!");
    }

    try {
      await axios.put(`http://localhost:5000/api/stalls/event/${eventid}/${stallId}`, formData);
      alert("Stall updated successfully!");
      navigate(`/stalls/${eventid}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update stall");
    }
  };

  return (
    <div className="edit-stall-container">
      <h2 className="edit-stall-title">{eventTitle} Event Stall</h2>
      <form className="edit-stall-form-new" onSubmit={handleSubmit}>

        <div className="field-group">
          <label>Stall ID:</label>
          <input type="text" value={stallId} disabled />
        </div>

        <div className="field-group">
          <label>Category:</label>
          <input type="text" name="category" value={formData.category} onChange={handleChange} required />
        </div>

        <div className="field-group">
          <label>Price:</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required />
        </div>

        <div className="field-group">
          <label>Location:</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} required />
        </div>

        <div className="field-group">
          <label>Available Stalls:</label>
          <input type="number" name="availableStalls" value={formData.availableStalls} onChange={handleChange} required />
        </div>

        <div className="field-group">
          <label>Description:</label>
          <textarea name="description" value={formData.description} onChange={handleChange} />
        </div>

        <div className="field-group">
          <label>Image URL:</label>
          <input type="text" name="image" value={formData.image} onChange={handleChange} />
        </div>

        <button type="submit">Update Stall</button>
      </form>
    </div>
  );
};

export default EditStall;