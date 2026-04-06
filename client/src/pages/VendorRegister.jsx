import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const initial = {
  name: "",
  nic: "",
  contact: "",
  address: "",
  email: "",
  password: "",
  confirmPassword: "",
  stallType: "",
};

export default function VendorRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function onBlur(e) {
    setTouched((p) => ({ ...p, [e.target.name]: true }));
  }

  /* VALIDATION */
  const errors = useMemo(() => {
    const e = {};

    if (!form.name.trim()) e.name = "Vendor name is required";

    if (!form.nic.trim()) e.nic = "NIC is required";
    else if (!/^(?:\d{9}[VvXx]|\d{12})$/.test(form.nic.trim()))
      e.nic = "NIC must be 123456789V (old) or 200331310064 (new)";

    const cleanContact = form.contact.replace(/\D/g, "");
    if (!cleanContact) e.contact = "Contact number is required";
    else if (cleanContact.length !== 10)
      e.contact = "Contact number must be 10 digits";

    if (!form.address.trim()) e.address = "Address is required";

    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Email must be valid";

    if (!form.stallType) e.stallType = "Stall type is required";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";

    if (!form.confirmPassword)
      e.confirmPassword = "Confirm password is required";
    else if (form.confirmPassword !== form.password)
      e.confirmPassword = "Passwords do not match";

    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;
  const showError = (field) => touched[field] && errors[field];

  /* SUBMIT */
  async function onSubmit(e) {
    e.preventDefault();
    setTouched({
      name: true,
      nic: true,
      contact: true,
      address: true,
      email: true,
      stallType: true,
      password: true,
      confirmPassword: true,
    });

    // Popup for incomplete fields
    if (!isValid) {
      alert("Please fill all required fields correctly before submitting.");
      return;
    }

    try {
      setSubmitting(true);

      const cleanContact = form.contact.replace(/\D/g, "");

      const payload = {
        name: form.name.trim(),
        nic: form.nic.trim(),
        contact: cleanContact,
        address: form.address.trim(),
        email: form.email.trim(),
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

  /* UI */
  return (
    <div className="page">
      <Navbar />

      <main className="container">
        <section className="authCard">
          <h1 className="authTitle">Vendor Sign Up</h1>
          <p className="authSubtitle">Submit your vendor request</p>

          <form className="form" onSubmit={onSubmit} noValidate>
            <div className="field">
              <label>Vendor Name</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="Full Name"
              />
              {showError("name") && <p className="error">{errors.name}</p>}
            </div>

            <div className="field">
              <label>NIC Number</label>
              <input
                name="nic"
                value={form.nic}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="123456789V or 200331310064"
              />
              {showError("nic") && <p className="error">{errors.nic}</p>}
            </div>

            <div className="field">
              <label>Contact Number</label>
              <input
                name="contact"
                value={form.contact}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="0771234567"
              />
              {showError("contact") && <p className="error">{errors.contact}</p>}
            </div>

            <div className="field">
              <label>Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={onChange}
                onBlur={onBlur}
                rows="3"
              />
              {showError("address") && <p className="error">{errors.address}</p>}
            </div>

            <div className="field">
              <label>Email</label>
              <input
                name="email"
                value={form.email}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="example@domain.com"
              />
              {showError("email") && <p className="error">{errors.email}</p>}
            </div>

            <div className="field">
              <label>Stall Type</label>
              <select
                name="stallType"
                value={form.stallType}
                onChange={onChange}
                onBlur={onBlur}
              >
                <option value=""></option>
                <option value="Food">Food</option>
                <option value="Merchandise">Merchandise</option>
                <option value="Games">Games</option>
                <option value="Services">Services</option>
                <option value="Other">Other</option>
              </select>
              {showError("stallType") && <p className="error">{errors.stallType}</p>}
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                onBlur={onBlur}
              />
              {showError("password") && <p className="error">{errors.password}</p>}
            </div>

            <div className="field">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={onChange}
                onBlur={onBlur}
              />
              {showError("confirmPassword") && (
                <p className="error">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              className="btn btn--primary btn--full"
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