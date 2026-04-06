import { useState } from "react";
import axios from "axios";
import "./ClubForm.css";

export default function CreateClub() {
  const [form, setForm] = useState({
    clubName: "",
    email: "",
    password: "",
    faculty: "",
    clubid: "", // Will be set after creation
  });

  const [errors, setErrors] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Validate email & password
  const validate = () => {
    let valid = true;
    let tempErrors = { email: "", password: "" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      tempErrors.email = "Enter a valid email address.";
      valid = false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      tempErrors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, and a number.";
      valid = false;
    }

    setErrors(tempErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!form.faculty) {
      alert("Please select a faculty");
      return;
    }

    try {
      // POST to backend (create club)
      const res = await axios.post("http://localhost:5000/api/clubs/create", {
        clubName: form.clubName,
        email: form.email,
        password: form.password,
        faculty: form.faculty,
      });

      alert("Club Created Successfully!");
      
      // Set the clubId returned from backend
      setForm({
        clubName: "",
        email: "",
        password: "",
        faculty: "",
        clubid: res.data.club.clubid, // Read-only field
      });

      setErrors({ email: "", password: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Error creating club");
    }
  };

  return (
    <div className="create-club-page">
      <div className="create-club-container">
        <h2>Create Club</h2>
        <form onSubmit={handleSubmit}>
          {/* Club ID (read-only) */}
          <input
            type="text"
            name="clubid"
            placeholder="Club ID (auto-generated)"
            value={form.clubid}
            readOnly
          />

          {/* Club Name */}
          <input
            type="text"
            name="clubName"
            placeholder="Club Name"
            value={form.clubName}
            onChange={handleChange}
            required
          />

          {/* Faculty */}
          <select
            name="faculty"
            value={form.faculty}
            onChange={handleChange}
            required
          >
            <option value="">Select Faculty</option>
            <option value="Science">Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Business">Business</option>
            <option value="Arts">Arts</option>
          </select>

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          {errors.email && <div className="error">{errors.email}</div>}

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {errors.password && <div className="error">{errors.password}</div>}

          <button type="submit">Create Club</button>
        </form>
      </div>
    </div>
  );
}