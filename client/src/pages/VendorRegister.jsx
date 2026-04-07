import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./VendorRegister.css";

const initial = {
  companyName: "",
  contact: "",
  address: "",
  email: "",
  businessRegistrationNo: "",
  stallType: "",
  password: "",
  confirmPassword: "",
};

export default function VendorRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onBlur(e) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }

  const errors = useMemo(() => {
    const e = {};

    if (!form.companyName.trim()) {
      e.companyName = "Company name is required";
    }

    const cleanContact = form.contact.replace(/\D/g, "");
    if (!cleanContact) {
      e.contact = "Contact number is required";
    } else if (cleanContact.length !== 10) {
      e.contact = "Contact number must be 10 digits";
    }

    if (!form.address.trim()) {
      e.address = "Business address is required";
    }

    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = "Email must be valid";
    }

    if (!form.businessRegistrationNo.trim()) {
      e.businessRegistrationNo = "Business registration number is required";
    }

    if (!form.stallType) {
      e.stallType = "Stall type is required";
    }

    if (!form.password) {
      e.password = "Password is required";
    } else if (form.password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }

    if (!form.confirmPassword) {
      e.confirmPassword = "Confirm password is required";
    } else if (form.confirmPassword !== form.password) {
      e.confirmPassword = "Passwords do not match";
    }

    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;
  const showError = (field) => touched[field] && errors[field];

  async function onSubmit(e) {
    e.preventDefault();

    setTouched({
      companyName: true,
      contact: true,
      address: true,
      email: true,
      businessRegistrationNo: true,
      stallType: true,
      password: true,
      confirmPassword: true,
    });

    if (!isValid) {
      alert("Please fill all required fields correctly before submitting.");
      return;
    }

    try {
      setSubmitting(true);

      const cleanContact = form.contact.replace(/\D/g, "");

      const payload = {
        companyName: form.companyName.trim(),
        contact: cleanContact,
        address: form.address.trim(),
        email: form.email.trim(),
        businessRegistrationNo: form.businessRegistrationNo.trim(),
        stallType: form.stallType,
        password: form.password,
      };

      const res = await fetch("http://localhost:5000/api/vendors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.errors
          ? data.errors.map((x) => `• ${x.msg}`).join("\n")
          : data.message || "Registration failed";

        alert(msg);
        return;
      }

      alert("Vendor request submitted! Waiting for admin approval.");
      setForm(initial);
      setTouched({});
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="vendor-page">
      <div className="vendor-page__bg"></div>

      <div className="vendor-page__topbar">
        <Link to="/" className="vendor-home-btn">
          <span>&#8617;</span> Go Back
        </Link>
      </div>

      <main className="vendor-layout">
        <section className="vendor-info">

          <h1 className="vendor-info__title">
            Grow your business through <span>campus events</span>
          </h1>

          <div className="vendor-feature-grid">
            <div className="vendor-feature-card">
              <div className="vendor-feature-card__icon">🏪</div>
              <h3>Get Stall Opportunities</h3>
              <p>
                Receive access to event-related vendor opportunities from
                university organizers.
              </p>
            </div>

            <div className="vendor-feature-card">
              <div className="vendor-feature-card__icon">🤝</div>
              <h3>Connect with Organizers</h3>
              <p>
                Build direct relationships with event
                planners in one platform.
              </p>
            </div>

            <div className="vendor-feature-card">
              <div className="vendor-feature-card__icon">📈</div>
              <h3>Increase Visibility</h3>
              <p>
                Showcase your brand, products, and services to a large student
                audience.
              </p>
            </div>

            <div className="vendor-feature-card">
              <div className="vendor-feature-card__icon">⚡</div>
              <h3>Simple Registration</h3>
              <p>
                Submit your company details quickly and start your approval
                process easily.
              </p>
            </div>
          </div>
        </section>

        <section className="vendor-form-card">
          <div className="vendor-form-card__header">
            <h2>Submit Registration Request</h2>
          </div>

          <form className="vendor-form" onSubmit={onSubmit} noValidate>
            <div className="vendor-field">
              <label>Company Name</label>
              <input
                name="companyName"
                value={form.companyName}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="ABC Food Corner"
              />
              {showError("companyName") && (
                <p className="vendor-error">{errors.companyName}</p>
              )}
            </div>

            <div className="vendor-field">
              <label>Contact Number</label>
              <input
                name="contact"
                value={form.contact}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="0771234567"
              />
              {showError("contact") && (
                <p className="vendor-error">{errors.contact}</p>
              )}
            </div>

            <div className="vendor-field">
              <label>Business Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={onChange}
                onBlur={onBlur}
                rows="3"
                placeholder="No 123, Main Street, Colombo"
              />
              {showError("address") && (
                <p className="vendor-error">{errors.address}</p>
              )}
            </div>

            <div className="vendor-field">
              <label>Business Email</label>
              <input
                name="email"
                value={form.email}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="company@email.com"
              />
              {showError("email") && (
                <p className="vendor-error">{errors.email}</p>
              )}
            </div>

            <div className="vendor-field">
              <label>Business Registration Number</label>
              <input
                name="businessRegistrationNo"
                value={form.businessRegistrationNo}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="PV12345678"
              />
              {showError("businessRegistrationNo") && (
                <p className="vendor-error">{errors.businessRegistrationNo}</p>
              )}
            </div>

            <div className="vendor-field">
              <label>Stall Type</label>
              <select
                name="stallType"
                value={form.stallType}
                onChange={onChange}
                onBlur={onBlur}
              >
                <option value="">Select Stall Type</option>
                <option value="Food">Food</option>
                <option value="Merchandise">Merchandise</option>
                <option value="Games">Games</option>
                <option value="Services">Services</option>
                <option value="Other">Other</option>
              </select>
              {showError("stallType") && (
                <p className="vendor-error">{errors.stallType}</p>
              )}
            </div>

            <div className="vendor-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="Enter password"
              />
              {showError("password") && (
                <p className="vendor-error">{errors.password}</p>
              )}
            </div>

            <div className="vendor-field">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="Re-enter password"
              />
              {showError("confirmPassword") && (
                <p className="vendor-error">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              className="vendor-submit-btn"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Submitting request..." : "Submit Request"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}