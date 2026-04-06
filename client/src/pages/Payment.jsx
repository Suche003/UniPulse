import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("unipulse_user");
  const user = storedUser ? JSON.parse(storedUser) : {};
  const studentId = user?.id || "guest";

  const paymentKey = `unipulse_payments_${studentId}`;

  const [name, setName] = useState(user.name || "");
  const [contact, setContact] = useState(user.contact || "");
  const [tickets, setTickets] = useState(1);
  const [reference, setReference] = useState("");
  const [slip, setSlip] = useState(null);
  const [preview, setPreview] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setSlip(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!name || !contact || !reference || !slip) {
      alert("Please fill all fields and upload slip");
      return;
    }

    const stored = JSON.parse(localStorage.getItem(paymentKey) || "[]");

    const newPayment = {
      id: Date.now().toString(),
      eventId: id,
      name,
      contact,
      tickets: Number(tickets),
      reference,
      status: "Pending",
      date: new Date().toISOString(),
    };

    localStorage.setItem(
      paymentKey,
      JSON.stringify([...stored, newPayment])
    );

    alert("Payment submitted successfully! Waiting for approval.");
    navigate("/student/dashboard");
  }

  return (
    <div className="page">
      <Navbar />

      <main className="container">
        <section className="paymentCard upgradedPayment">
          <h1 className="paymentTitle">Complete Your Payment</h1>
          <p className="paymentSubtitle">
            Fill in your details and upload your payment slip.
          </p>

          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label>Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="field">
              <label>Contact Number</label>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="0771234567"
              />
            </div>

            <div className="field">
              <label>Number of Tickets</label>
              <input
                type="number"
                min="1"
                value={tickets}
                onChange={(e) => setTickets(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Payment Reference Number</label>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Enter transaction reference"
              />
            </div>

            <div className="field">
              <label>Upload Payment Slip</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            {preview && (
              <div className="slipPreview">
                <img src={preview} alt="Slip preview" />
              </div>
            )}

            <button className="btn btn--primary btn--full">
              Submit Payment Request
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}