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
        if (value.replace(/\D/g, "").length !== 10) {
          return "Phone must be 10 digits (e.g., 0712345678)";
        }
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
    confirmPassword: touched.confirmPassword
      ? validateField("confirmPassword", form.confirmPassword)
      : "",
    contactPhone: touched.contactPhone
      ? validateField("contactPhone", form.contactPhone)
      : "",
    description: touched.description
      ? validateField("description", form.description)
      : "",
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

  return (
    <div className="sponsor-page">
      <div className="sponsor-page__bg"></div>

      <div className="sponsor-page__topbar">
        <Link to="/" className="sponsor-home-btn">
         <span>&#8617;</span> Go Back
        </Link>
      </div>

      <main className="sponsor-layout">
        <section className="sponsor-info">
          <h1 className="sponsor-info__title">
            Bringing Events to Life with <span>Your Brand</span>
          </h1>

          <div className="sponsor-feature-grid">
            <div className="sponsor-feature-card">
              <div className="sponsor-feature-card__icon">📢</div>
              <h3>Boost Brand Visibility</h3>
              <p>
                Showcase your brand across events and reach a highly
                engaged audience.
              </p>
            </div>

            <div className="sponsor-feature-card">
              <div className="sponsor-feature-card__icon">🤝</div>
              <h3>Partner with Organizers</h3>
              <p>
                Collaborate directly with organizers planning impactful
                events on campus.
              </p>
            </div>

            <div className="sponsor-feature-card">
              <div className="sponsor-feature-card__icon">🎯</div>
              <h3>Choose Sponsorship Packages</h3>
              <p>
                Select the package that matches your goals in
                a flexible way.
              </p>
            </div>

            <div className="sponsor-feature-card">
              <div className="sponsor-feature-card__icon">🚀</div>
              <h3>Grow Your Presence</h3>
              <p>
                Build long-term connections with students and strengthen your
                presence.
              </p>
            </div>
          </div>
        </section>

        <section className="sponsor-form-card">
          <div className="sponsor-form-card__header">
            <h2>Sponsor Registration</h2>
          </div>

          {serverError && <div className="sponsor-alert">{serverError}</div>}

          <form onSubmit={handleSubmit} className="sponsor-form" noValidate>
            <div className="sponsor-field">
              <label>Organization Name</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="Your company / organization name"
              />
              {errors.name && <p className="sponsor-error">{errors.name}</p>}
            </div>

            <div className="sponsor-field">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="contact@yourcompany.com"
              />
              {errors.email && <p className="sponsor-error">{errors.email}</p>}
            </div>

            <div className="sponsor-row">
              <div className="sponsor-field">
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder="Enter password"
                />
                {errors.password && (
                  <p className="sponsor-error">{errors.password}</p>
                )}
              </div>

              <div className="sponsor-field">
                <label>Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder="Re-enter password"
                />
                {errors.confirmPassword && (
                  <p className="sponsor-error">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="sponsor-field">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                onBlur={onBlur}
                rows="3"
                maxLength="500"
                placeholder="Tell us about your organization"
              />
              <div className="sponsor-counter">
                {form.description.length}/500 characters
              </div>
              {errors.description && (
                <p className="sponsor-error">{errors.description}</p>
              )}
            </div>

            <div className="sponsor-row">
              <div className="sponsor-field">
                <label>Website</label>
                <input
                  name="website"
                  value={form.website}
                  onChange={onChange}
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div className="sponsor-field">
                <label>Phone</label>
                <input
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder="0712345678"
                />
                {errors.contactPhone && (
                  <p className="sponsor-error">{errors.contactPhone}</p>
                )}
              </div>
            </div>

            <div className="sponsor-field">
              <label>Sponsorship Package (Optional)</label>

              {packagesLoading ? (
                <div className="sponsor-loading">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <select
                  name="packageId"
                  value={form.packageId}
                  onChange={onChange}
                >
                  <option value="">Select a package (optional)</option>
                  {packages.map((pkg) => (
                    <option key={pkg._id} value={pkg._id}>
                      {pkg.name} - ${pkg.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              )}

              <small className="sponsor-help">
                You can choose a package now and change it later if needed.
              </small>
            </div>

            <button
              type="submit"
              className="sponsor-submit-btn"
              disabled={submitting}
            >
              {submitting ? "Creating account..." : "Submit Request"}
            </button>

            <p className="sponsor-footer">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}