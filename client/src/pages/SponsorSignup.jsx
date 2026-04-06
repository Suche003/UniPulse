import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { apiRequest } from "../api/api";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import "./SponsorSignup.css";

export default function SponsorSignup() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    description: "",
    website: "",
    contactPhone: "",
    packageId: "",
  });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Fallback packages in case API fails or returns empty
  const fallbackPackages = [
    { _id: "platinum", name: "Platinum", price: 10000 },
    { _id: "gold", name: "Gold", price: 5000 },
    { _id: "silver", name: "Silver", price: 2500 },
    { _id: "bronze", name: "Bronze", price: 1000 },
  ];

  useEffect(() => {
    const loadPackages = async () => {
      try {
        let data = await apiRequest("/api/packages");
        if (!data || data.length === 0) {
          data = fallbackPackages;
        }
        setPackages(data);
      } catch (err) {
        console.error("Failed to load packages", err);
        setPackages(fallbackPackages);
      } finally {
        setPackagesLoading(false);
      }
    };
    loadPackages();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (serverError) setServerError("");
  };

  const onBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  // Validation logic
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim() ? "" : "Organization name is required";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email format";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== form.password) return "Passwords do not match";
        return "";
      case "contactPhone":
        if (!value) return "";
        const digits = value.replace(/\D/g, "");
        if (digits.length !== 10) return "Phone must be 10 digits (e.g., 0712345678)";
        return "";
      case "description":
        if (value.length > 500) return "Description must not exceed 500 characters";
        return "";
      default:
        return "";
    }
  };

  const errors = {
    name: touched.name ? validateField("name", form.name) : "",
    email: touched.email ? validateField("email", form.email) : "",
    password: touched.password ? validateField("password", form.password) : "",
    confirmPassword: touched.confirmPassword ? validateField("confirmPassword", form.confirmPassword) : "",
    contactPhone: touched.contactPhone ? validateField("contactPhone", form.contactPhone) : "",
    description: touched.description ? validateField("description", form.description) : "",
  };

  const isValid = Object.values(errors).every((e) => e === "") && form.name && form.email && form.password && form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      contactPhone: true,
      description: true,
    });

    if (!isValid) {
      toast.error("Please fix the errors above");
      return;
    }

    setSubmitting(true);
    setServerError("");

    try {
      const cleanedPhone = form.contactPhone.replace(/\D/g, "");
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        description: form.description.trim(),
        website: form.website.trim(),
        contactPhone: cleanedPhone,
        packageId: form.packageId,
      };

      const res = await fetch("http://localhost:5000/api/sponsors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.message || "Registration failed";
        setServerError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      toast.success("Registration successful! ✅ Please wait for admin approval.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const errorMsg = "Server error. Please try again.";
      setServerError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sponsor-signup-page">
      <Navbar />

      {/* Hero Section */}
      <div className="signup-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Partner with University Events</h1>
          <p>Become a sponsor and connect with thousands of students, clubs, and societies.</p>
          <div className="hero-badge">✨ 25% off your first event sponsorship ✨</div>
        </div>
      </div>

      {/* Signup Form Card */}
      <div className="signup-container">
        <div className="signup-card">
          <h2>Create Sponsor Account</h2>
          <p className="signup-subtitle">Join our community of valued partners</p>

          {serverError && <div className="alert alert-error">{serverError}</div>}

          <form onSubmit={handleSubmit} className="signup-form" noValidate>
            {/* Organization Name */}
            <div className="form-group">
              <label>🏢 Organization Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="Your company / organization name"
                className={errors.name ? "error" : ""}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label>📧 Email *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="contact@yourcompany.com"
                className={errors.email ? "error" : ""}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            {/* Password + Confirm Password */}
            <div className="form-row">
              <div className="form-group">
                <label>🔒 Password *</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={errors.password ? "error" : ""}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label>🔒 Confirm Password *</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={errors.confirmPassword ? "error" : ""}
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>

            {/* Description with counter */}
            <div className="form-group">
              <label>📝 Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                onBlur={onBlur}
                rows="3"
                placeholder="Tell us about your organization (max 500 characters)"
                maxLength="500"
                className={errors.description ? "error" : ""}
              />
              <div className="char-counter">{form.description.length}/500 characters</div>
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            {/* Website + Phone row */}
            <div className="form-row">
              <div className="form-group">
                <label>🌐 Website</label>
                <input name="website" value={form.website} onChange={onChange} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>📞 Phone</label>
                <input
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder="0712345678"
                  className={errors.contactPhone ? "error" : ""}
                />
                {errors.contactPhone && <span className="error-text">{errors.contactPhone}</span>}
                <small>10 digits, e.g., 0712345678</small>
              </div>
            </div>

            {/* Sponsorship Package dropdown (styled) */}
            <div className="form-group package-selector">
              <label>🏆 Sponsorship Package (optional)</label>
              {packagesLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className="custom-select-wrapper">
                  <select
                    name="packageId"
                    value={form.packageId}
                    onChange={onChange}
                    className={errors.packageId ? "error" : ""}
                  >
                    <option value="">Select a package (optional)</option>
                    {packages.map((pkg) => (
                      <option key={pkg._id} value={pkg._id}>
                        {pkg.name} - ${pkg.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <span className="select-arrow">⌵</span>
                </div>
              )}
              <small>Choosing a package will set your sponsorship amount. You can change it later.</small>
              {errors.packageId && <span className="error-text">{errors.packageId}</span>}
            </div>

            <button type="submit" className="btn-signup" disabled={submitting}>
              {submitting ? "Creating account..." : "Register as Sponsor"}
            </button>

            <p className="signup-footer">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}