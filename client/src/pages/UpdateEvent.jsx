import { useState, useEffect } from "react";
import axios from "axios";
import "./EventForm.css";

export default function UpdateEvent({ eventId }) {
  const [form, setForm] = useState({
    eventid: "",
    clubid: "",
    title: "",
    description: "",
    date: "",
    location: "",
    ispaid: false,
    ticketPrice: 0,
    pdf: "",
    image: "",
    status: "pending",
  });

  const [errors, setErrors] = useState({});

  // LOAD EXISTING EVENT DATA
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/events/${eventId}`
        );

        const data = res.data.event;

        setForm({
          ...data,
          date: data.date ? data.date.substring(0, 10) : "", // format date
        });
      } catch (err) {
        console.log(err);
      }
    };

    if (eventId) fetchEvent();
  }, [eventId]);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // VALIDATION
  const validate = () => {
    let tempErrors = {};
    let valid = true;

    if (!/^[A-Za-z\s]{3,}$/.test(form.title)) {
      tempErrors.title = "Title must be at least 3 letters (letters only)";
      valid = false;
    }

    if (form.description && !/^[A-Za-z\s]+$/.test(form.description)) {
      tempErrors.description = "Description can only contain letters";
      valid = false;
    }

    if (!form.date || new Date(form.date) < new Date()) {
      tempErrors.date = "Date must be in the future";
      valid = false;
    }

    if (!form.location) {
      tempErrors.location = "Location is required";
      valid = false;
    }

    if (form.ispaid && (!form.ticketPrice || form.ticketPrice <= 0)) {
      tempErrors.ticketPrice = "Enter valid ticket price";
      valid = false;
    }

    if (!form.pdf) {
      tempErrors.pdf = "PDF is required";
      valid = false;
    }

    setErrors(tempErrors);
    return valid;
  };

  // SUBMIT UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await axios.put(
        `http://localhost:5000/api/events/update/${eventId}`,
        form
      );

      alert("Event Updated Successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error updating event");
    }
  };

  return (
    <div className="event-form-container">
      <h2>Update Event</h2>

      <form onSubmit={handleSubmit}>
        {/* EVENT ID (READ ONLY) */}
        <input
          type="text"
          name="eventid"
          value={form.eventid}
          readOnly
        />

        {/* CLUB ID */}
        <input
          type="text"
          name="clubid"
          placeholder="Club ID"
          value={form.clubid}
          onChange={handleChange}
          required
        />

        {/* TITLE */}
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        {errors.title && <div className="error">{errors.title}</div>}

        {/* DESCRIPTION */}
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        {errors.description && <div className="error">{errors.description}</div>}

        {/* DATE */}
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        {errors.date && <div className="error">{errors.date}</div>}

        {/* LOCATION */}
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
        />
        {errors.location && <div className="error">{errors.location}</div>}

        {/* PAID EVENT */}
        <label>
          Paid Event:
          <input
            type="checkbox"
            name="ispaid"
            checked={form.ispaid}
            onChange={handleChange}
          />
        </label>

        {/* TICKET PRICE */}
        {form.ispaid && (
          <>
            <input
              type="number"
              name="ticketPrice"
              placeholder="Ticket Price"
              value={form.ticketPrice}
              onChange={handleChange}
              min="0"
            />
            {errors.ticketPrice && (
              <div className="error">{errors.ticketPrice}</div>
            )}
          </>
        )}

        {/* PDF */}
        <input
          type="text"
          name="pdf"
          placeholder="PDF URL"
          value={form.pdf}
          onChange={handleChange}
          required
        />
        {errors.pdf && <div className="error">{errors.pdf}</div>}

        {/* IMAGE */}
        <input
          type="text"
          name="image"
          placeholder="Image URL"
          value={form.image}
          onChange={handleChange}
        />

        {/* STATUS */}
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <button type="submit">Update Event</button>
      </form>
    </div>
  );
}