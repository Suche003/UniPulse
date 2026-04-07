import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
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
        if (!data || data.length === 0) data = fallbackPackages;
        setPackages(data);
      } catch (err) {
        console.error(err);
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
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(value)) return "Must contain at least one uppercase letter";
        if (!/[a-z]/.test(value)) return "Must contain at least one lowercase letter";
        if (!/[0-9]/.test(value)) return "Must contain at least one number";
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
      case "website":
        if (value && !/^https?:\/\/[^\s]+$/.test(value)) {
          return "Website must start with http:// or https://";
        }
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
    website: touched.website ? validateField("website", form.website) : "",
  };

  const isValid =
    Object.values(errors).every((e) => e === "") &&
    form.name &&
    form.email &&
    form.password &&
    form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      contactPhone: true,
      description: true,
      website: true,
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
      toast.success("Registration successful! Please wait for admin approval.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMsg = "Server error. Please try again.";
      setServerError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = form.description.length;

  const features = [
    { icon: "📢", title: "Boost Brand Visibility", description: "Showcase your brand across events and reach a highly engaged audience." },
    { icon: "🤝", title: "Partner with Organizers", description: "Collaborate directly with organizers planning impactful events on campus." },
    { icon: "🎯", title: "Choose Sponsorship Packages", description: "Select the package that matches your goals in a flexible way." },
    { icon: "🚀", title: "Grow Your Presence", description: "Build long-term connections with students and strengthen your presence." }
  ];

  return (
    <div className="sponsor-signup-page">
      <div className="sponsor-signup-bg"></div>
      <div className="sponsor-signup-topbar">
        <Link to="/" className="sponsor-home-btn"><span>&#8617;</span> Go Back</Link>
      </div>
      <main className="sponsor-signup-layout">
        {/* Left column – feature cards */}
        <div className="sponsor-signup-left">
          <h1 className="left-title">Bringing <span>Events to Life</span> with <span>Your Brand</span></h1>
          <div className="features-grid">
            {features.map((feat, idx) => (
              <div className="feature-card" key={idx}>
                <div className="feature-icon">{feat.icon}</div>
                <h3>{feat.title}</h3>
                <p>{feat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column – form with icons on labels only */}
        <div className="sponsor-signup-right">
          <div className="sponsor-form-card">
            <div className="form-header">
              <h2>Create Sponsor Account</h2>
              <p>Join our community of valued partners</p>
            </div>
            {serverError && <div className="sponsor-alert">{serverError}</div>}
            <form onSubmit={handleSubmit} className="sponsor-signup-form" noValidate>
              <div className="form-field full-width">
                <label>🏢 Organization Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder="Your company / organization name"
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>

              <div className="form-field full-width">
                <label>📧 Email *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder="contact@yourcompany.com"
                />
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>🔒 Password *</label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder="Create a strong password"
                  />
                  {errors.password && <p className="field-error">{errors.password}</p>}
                </div>
                <div className="form-field">
                  <label>✅ Confirm Password *</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder="Re-enter password"
                  />
                  {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="form-field full-width">
                <label>📝 Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  onBlur={onBlur}
                  rows="4"
                  maxLength="500"
                  placeholder="Tell us about your organization (max 500 characters)"
                />
                <div className="char-counter">{charCount}/500 characters</div>
                {errors.description && <p className="field-error">{errors.description}</p>}
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>🌐 Website</label>
                  <input
                    name="website"
                    value={form.website}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder="https://yourcompany.com"
                  />
                  {errors.website && <p className="field-error">{errors.website}</p>}
                </div>
                <div className="form-field">
                  <label>📞 Phone</label>
                  <input
                    name="contactPhone"
                    value={form.contactPhone}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder="0712345678"
                  />
                  <small className="field-hint">10 digits, e.g., 0712345678</small>
                  {errors.contactPhone && <p className="field-error">{errors.contactPhone}</p>}
                </div>
              </div>

              <div className="form-field full-width">
                <label>🎁 Sponsorship Package (optional)</label>
                {packagesLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <select name="packageId" value={form.packageId} onChange={onChange}>
                    <option value="">Select a package (optional)</option>
                    {packages.map((pkg) => (
                      <option key={pkg._id} value={pkg._id}>
                        {pkg.name} - ${pkg.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                )}
                <small className="field-hint">
                  Choosing a package will set your sponsorship amount. You can change it later.
                </small>
              </div>

              <button type="submit" className="register-btn" disabled={submitting}>
                {submitting ? "Registering..." : "Register as Sponsor"}
              </button>
              <p className="login-footer">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}