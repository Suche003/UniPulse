import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import "./Payment.css";

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  async function fetchTicket() {
    try {
      setLoading(true);

      const token = localStorage.getItem("unipulse_token");
      const storedUser = localStorage.getItem("unipulse_user");
      const user = storedUser ? JSON.parse(storedUser) : {};

      const res = await axios.get(
        `http://localhost:5000/api/student/tickets/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTicket(res.data);
      setCardName(user.name || "");
      setEmail(user.email || "");
    } catch (error) {
      console.error("Failed to load payment data:", error);
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    const newErrors = {};

    if (!cardName.trim()) {
      newErrors.cardName = "Cardholder name is required";
    }

    const cleanedCard = cardNumber.replace(/\s/g, "");

    if (!/^\d{16}$/.test(cleanedCard)) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      newErrors.expiry = "Expiry must be in MM/YY format";
    } else {
      const [month, year] = expiry.split("/");
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;

      if (
        Number(month) < 1 ||
        Number(month) > 12 ||
        Number(year) < currentYear ||
        (Number(year) === currentYear && Number(month) < currentMonth)
      ) {
        newErrors.expiry = "Card expiry is invalid";
      }
    }

    if (!/^\d{3}$/.test(cvv)) {
      newErrors.cvv = "CVV must be 3 digits";
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Valid email is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleCardNumberChange(value) {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    const formatted = cleaned.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  }

  function handleExpiryChange(value) {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);

    if (cleaned.length >= 3) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setExpiry(cleaned);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const token = localStorage.getItem("unipulse_token");

      await axios.post(
        `http://localhost:5000/api/student/tickets/${id}/pay`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/student/dashboard", {
        state: {
          paymentSuccessMessage: "Payment Purchased",
        },
      });
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="payment-page">
        <Navbar />
        <main className="payment-container">
          <section className="payment-card">
            <h1>Loading Payment...</h1>
          </section>
        </main>
      </div>
    );
  }

  if (ticket?.status === "paid") {
    return (
      <div className="payment-page">
        <Navbar />
        <main className="payment-container">
          <section className="payment-card">
            <h1>Payment Purchased</h1>
            <p className="payment-hero__subtitle">
              This ticket has already been paid.
            </p>
            <div className="payment-actions">
              <button
                className="payment-btn payment-btn--primary"
                onClick={() => navigate("/student/dashboard")}
              >
                Back to Dashboard
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <Navbar />

      <main className="payment-container">
        <section className="payment-hero">
          <p className="payment-hero__tag">PAYMENT GATEWAY</p>
          <h1 className="payment-hero__title">Secure Ticket Payment</h1>
          <p className="payment-hero__subtitle">
            This is a showcase payment gateway for your UniPulse viva.
          </p>
        </section>

        <div className="payment-grid">
          <section className="payment-card">
            <h2 className="payment-section-title">Payment Details</h2>

            <form className="payment-form" onSubmit={handleSubmit}>
              <div className="payment-field">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Perera"
                />
                {errors.cardName && (
                  <p className="payment-error">{errors.cardName}</p>
                )}
              </div>

              <div className="payment-field">
                <label>Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                />
                {errors.cardNumber && (
                  <p className="payment-error">{errors.cardNumber}</p>
                )}
              </div>

              <div className="payment-row">
                <div className="payment-field">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    placeholder="MM/YY"
                  />
                  {errors.expiry && (
                    <p className="payment-error">{errors.expiry}</p>
                  )}
                </div>

                <div className="payment-field">
                  <label>CVV</label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                    }
                    placeholder="123"
                  />
                  {errors.cvv && (
                    <p className="payment-error">{errors.cvv}</p>
                  )}
                </div>
              </div>

              <div className="payment-field">
                <label>Billing Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@email.com"
                />
                {errors.email && (
                  <p className="payment-error">{errors.email}</p>
                )}
              </div>

              <div className="payment-actions">
                <button
                  type="button"
                  className="payment-btn payment-btn--ghost"
                  onClick={() => navigate(-1)}
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="payment-btn payment-btn--primary"
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : `Pay Rs. ${ticket?.amount || 0}`}
                </button>
              </div>
            </form>
          </section>

          <section className="payment-card">
            <h2 className="payment-section-title">Order Summary</h2>

            <div className="payment-summary">
              <div className="payment-summary-row">
                <span>Event</span>
                <strong>{ticket?.eventName}</strong>
              </div>

              <div className="payment-summary-row">
                <span>Ticket Quantity</span>
                <strong>1</strong>
              </div>

              <div className="payment-summary-row">
                <span>Student</span>
                <strong>{ticket?.studentIdDisplay || "Student"}</strong>
              </div>

              <div className="payment-summary-row">
                <span>Payment Type</span>
                <strong>Debit / Credit Card</strong>
              </div>

              <div className="payment-summary-row payment-summary-row--total">
                <span>Total</span>
                <strong>Rs. {ticket?.amount || 0}</strong>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}