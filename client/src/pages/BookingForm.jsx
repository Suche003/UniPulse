import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import "./BookingForm.css";

const BookingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // FALLBACK
  const { stall = null } = location.state || {};

  const { eventid: paramEventid } = useParams();

  const [eventName, setEventName] = useState("");
  const [stallCategory, setStallCategory] = useState("");
  const [email, setEmail] = useState("");

  const [formData, setFormData] = useState({
    phone: "",
    type: "",
  });

  const [errors, setErrors] = useState({
    phone: "",
    type: "",
  });

  const phonePattern = /^[0-9]{10}$/;
  const stallTypePattern = /^[A-Za-z\s]+$/;

  useEffect(() => {
    const storedVendor = localStorage.getItem("unipulse_user");

    if (storedVendor) {
      try {
        const vendor = JSON.parse(storedVendor);
        if (vendor.email) setEmail(vendor.email);
      } catch (err) {
        console.error("Failed to parse vendor info:", err);
      }
    }

    if (stall) {
      setEventName(stall.eventTitle || "");
      setStallCategory(stall.category || "");

      setFormData((prev) => ({
        ...prev,
        type: stall.type || "",
      }));
    }
  }, [stall]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "phone") {
      setErrors((prev) => ({
        ...prev,
        phone:
          value.trim() === ""
            ? "Phone Number is required"
            : phonePattern.test(value)
            ? ""
            : "Phone must be exactly 10 digits",
      }));
    }

    if (name === "type") {
      setErrors((prev) => ({
        ...prev,
        type:
          value.trim() === ""
            ? "Stall Type is required"
            : stallTypePattern.test(value)
            ? ""
            : "Stall Type must contain only letters",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {};

    if (!formData.phone.trim())
      validationErrors.phone = "Phone Number is required";
    else if (!phonePattern.test(formData.phone))
      validationErrors.phone = "Phone must be exactly 10 digits";

    if (!formData.type.trim())
      validationErrors.type = "Stall Type is required";
    else if (!stallTypePattern.test(formData.type))
      validationErrors.type = "Stall Type must contain only letters";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert("Please fill all required fields correctly!");
      return;
    }

    const stallId = stall?.stallId;
    const eventid = stall?.eventid || paramEventid;

    if (!stallId || !eventid) {
      alert("Cannot submit booking: Stall or Event not selected correctly.");
      return;
    }

    try {
      const payload = {
        eventid,
        stallId,
        email,
        phone: formData.phone,
        type: formData.type,
      };

      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit booking");

      alert(`Booking submitted successfully! Booking ID: ${data.bookingId}`);
      navigate("/vendor-stalls");
    } catch (err) {
      console.error("Booking error:", err);
      alert(`Failed to submit booking: ${err.message}`);
    }
  };

  return (
    <div className="booking-form-container">
      <h1>Book Stall</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Event Name
          <input type="text" value={eventName} disabled />
        </label>

        <label>
          Stall Category
          <input type="text" value={stallCategory} disabled />
        </label>

        <label>
          Email
          <input type="email" value={email} disabled />
        </label>

        <div className="floating-label">
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder=" "
          />
          <span className="label-text">Phone Number*</span>
          {errors.phone && <span className="error">{errors.phone}</span>}
        </div>

        <div className="floating-label">
          <input
            type="text"
            name="type"
            value={formData.type}
            onChange={handleChange}
            placeholder=" "
          />
          <span className="label-text">Stall Type*</span>
          {errors.type && <span className="error">{errors.type}</span>}
        </div>

        <button type="submit" disabled={errors.phone || errors.type}>
          Confirm Booking
        </button>
      </form>
    </div>
  );
};

export default BookingForm;