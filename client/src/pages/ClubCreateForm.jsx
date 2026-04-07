import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ClubForm.css";

export default function CreateClub() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    clubName: "",
    email: "",
    password: "",
    faculty: "",
  });

  const [errors, setErrors] = useState({
    clubName: "",
    email: "",
    password: "",
    faculty: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const facultyOptions = [
    "None",
    "Computing",
    "Human Science",
    "Engineering",
    "Hospitality",
    "Business Management",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSuccessMessage("");
  };

  const validate = () => {
    let valid = true;

    const tempErrors = {
      clubName: "",
      email: "",
      password: "",
      faculty: "",
    };

    if (!form.clubName.trim()) {
      tempErrors.clubName = "Club name is required.";
      valid = false;
    }

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

    if (!form.faculty) {
      tempErrors.faculty = "Please select a faculty.";
      valid = false;
    }

    setErrors(tempErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);
      setSuccessMessage("");

      await axios.post("http://localhost:5000/api/clubs/create", {
        clubName: form.clubName.trim(),
        email: form.email.trim(),
        password: form.password,
        faculty: form.faculty,
      });

      setSuccessMessage(
        "Club created successfully. The club can now log in using the email and password."
      );

      setForm({
        clubName: "",
        email: "",
        password: "",
        faculty: "",
      });

      setErrors({
        clubName: "",
        email: "",
        password: "",
        faculty: "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Error creating club");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="club-create-page">
      <div className="club-create-bg"></div>

      <div className="club-create-shell">
        <button
          type="button"
          className="club-create-back-btn"
          onClick={() => navigate("/superadmin/control-panel")}
        >
          <span>&#8617;</span> Go Back
        </button>

        <div className="club-create-card">
          <div className="club-create-header">
            <h1 className="club-create-title">Create Club or Society</h1>
          </div>

          <form onSubmit={handleSubmit} className="club-create-form" noValidate>
            <div className="club-create-field">
              <label className="club-create-label" htmlFor="clubName">
                Club or Society Name
              </label>
              <input
                className="club-create-input"
                id="clubName"
                type="text"
                name="clubName"
                placeholder="Enter club or society name"
                value={form.clubName}
                onChange={handleChange}
              />
              {errors.clubName && (
                <div className="club-create-error">{errors.clubName}</div>
              )}
            </div>

            <div className="club-create-field">
              <label className="club-create-label" htmlFor="faculty">
                Faculty
              </label>
              <select
                className="club-create-input"
                id="faculty"
                name="faculty"
                value={form.faculty}
                onChange={handleChange}
              >
                <option value="">Select Faculty</option>
                {facultyOptions.map((faculty) => (
                  <option key={faculty} value={faculty}>
                    {faculty}
                  </option>
                ))}
              </select>
              {errors.faculty && (
                <div className="club-create-error">{errors.faculty}</div>
              )}
            </div>

            <div className="club-create-field">
              <label className="club-create-label" htmlFor="email">
                Club Email
              </label>
              <input
                className="club-create-input"
                id="email"
                type="email"
                name="email"
                placeholder="Enter club email"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && (
                <div className="club-create-error">{errors.email}</div>
              )}
            </div>

            <div className="club-create-field">
              <label className="club-create-label" htmlFor="password">
                Password
              </label>
              <input
                className="club-create-input"
                id="password"
                type="password"
                name="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && (
                <div className="club-create-error">{errors.password}</div>
              )}
            </div>

            {successMessage && (
              <div className="club-create-success">{successMessage}</div>
            )}

            <button
              type="submit"
              className="club-create-submit-btn"
              disabled={submitting}
            >
              {submitting ? "Creating Club..." : "Create Club"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}