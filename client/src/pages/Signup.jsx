import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const initial = {
  name: "",
  nic: "",
  contact: "",
  address: "",
  regNo: "",
  password: "",
  confirmPassword: "",
};

export default function Signup() {
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

  /* ================= VALIDATION ================= */
  const errors = useMemo(() => {
    const e = {};

    if (!form.name.trim()) e.name = "Student name is required";

    if (!form.nic.trim()) e.nic = "NIC is required";
    else if (!/^(?:\d{9}[VvXx]|\d{12})$/.test(form.nic.trim()))
      e.nic = "NIC must be 123456789V (old) or 200331310064 (new)";

    const cleanContact = form.contact.replace(/\D/g, "");
    if (!cleanContact) e.contact = "Contact number is required";
    else if (cleanContact.length !== 10)
      e.contact = "Contact number must be 10 digits";

    if (!form.address.trim()) e.address = "Address is required";

    if (!form.regNo.trim()) e.regNo = "Student registration number is required";
    else if (!/^[A-Za-z]{2}\d{8}$/.test(form.regNo.trim()))
      e.regNo = "Format must be 2 letters + 8 numbers (IT23552456)";

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

  /* ================= SUBMIT ================= */
  async function onSubmit(e) {
    e.preventDefault();
    setTouched({
      name: true,
      nic: true,
      contact: true,
      address: true,
      regNo: true,
      password: true,
      confirmPassword: true,
    });

    if (!isValid) return;

    try {
      setSubmitting(true);

      const cleanContact = form.contact.replace(/\D/g, "");

      const payload = {
        name: form.name.trim(),
        nic: form.nic.trim(),
        contact: cleanContact,
        address: form.address.trim(),
        regNo: form.regNo.trim(),
        password: form.password,
      };

      const res = await fetch("http://localhost:5000/api/students/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // show detailed validation errors if available
        const msg = data?.errors
          ? data.errors.map((x) => `• ${x.msg}`).join("\n")
          : data.message || "Registration failed";
        alert(msg);
        return;
      }

      alert("Student registered successfully! Please login.");
      setForm(initial);
      setTouched({});

      // Redirect to login page
      navigate("/login");
    } catch (err) {
      alert("Server error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ================= UI ================= */
  return (
    <div className="page">
      <Navbar />

      <main className="container">
        <section className="authCard">
          <h1 className="authTitle">Student Sign Up</h1>
          <p className="authSubtitle">Create your UniPulse student account</p>

          <form className="form" onSubmit={onSubmit} noValidate>
            <div className="field">
              <label>Student Name</label>
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
                inputMode="numeric"
              />
              {showError("contact") && (
                <p className="error">{errors.contact}</p>
              )}
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
              {showError("address") && (
                <p className="error">{errors.address}</p>
              )}
            </div>

            <div className="field">
              <label>Student Registration Number</label>
              <input
                name="regNo"
                value={form.regNo}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="IT23552456"
              />
              {showError("regNo") && <p className="error">{errors.regNo}</p>}
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
              {showError("password") && (
                <p className="error">{errors.password}</p>
              )}
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
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}