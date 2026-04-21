import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import visaLogo from "../assets/visa.png";
import mastercardLogo from "../assets/Master.png";
import americanExpressLogo from "../assets/AmericanExpress.png";

import "./StallPayment.css";

const StallPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Init from location.state if available
  const [stall, setStall] = useState(location.state?.stall || null);
  const [bookingId, setBookingId] = useState(location.state?.bookingId || null);

  // Fetch stall details if page refreshed and data missing
  useEffect(() => {
    if ((!stall || !bookingId) && location.state?.bookingId) {
      axios
        .get(`http://localhost:5000/api/booking-stalls/${location.state.bookingId}`)
        .then((res) => {
          setStall(res.data.stall);
          setBookingId(res.data.bookingId);
        })
        .catch((err) => console.error("Fetch stall error:", err));
    }
  }, [stall, bookingId, location.state]);

  const [eventTitle] = useState(stall?.eventTitle || "");
  const [stallType] = useState(stall?.type || "");
  const [price] = useState(stall?.price || 0);

  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardType, setCardType] = useState("Visa");

  const [errors, setErrors] = useState({});

  if (!stall || !bookingId) {
    return <p className="error-text">Failed to load stall or booking data.</p>;
  }

  const validate = () => {
    const errs = {};
    if (!cardHolder.trim()) errs.cardHolder = "Card Holder Name is required";
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, "")))
      errs.cardNumber = "Card number must be 16 digits";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry))
      errs.expiry = "Expiry must be in MM/YY format";
    if (!/^\d{3}$/.test(cvv)) errs.cvv = "CVV must be exactly 3 digits";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/stall-payment/pay",
        {
          bookingId,
          eventid: stall.eventid,
          stallId: stall.stallId,
          type: stall.type,
          price: price,
          cardHolderName: cardHolder,
          cardType: cardType,
          cardNumber: cardNumber,
          expiryDate: expiry,
        }
      );

      if (res.data.success) {
        alert(`Payment successful 🎉 Rs.${price} has been paid.`);
        navigate("/approved-stalls", { state: { paidBookingId: bookingId } });
      } else {
        alert(`Payment failed ❌`);
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed ❌");
    }
  };

  // Demo autofill button
  const handleDemo = () => {
    setCardHolder("Pasindu Maleesha");
    setCardNumber("1234567890123456"); 
    setExpiry("12/28");
    setCvv("342");
    setCardType("MasterCard");
    setErrors({});
  };

  return (

    <div className="stall-payment-card">
      <h2 className="form-title">Stall Payment</h2>

      <form className="payment-form" onSubmit={handleSubmit}>
        <label>
          Event
          <input type="text" value={eventTitle} readOnly />
        </label>

        <label>
          Stall Type
          <input type="text" value={stallType} readOnly />
        </label>

        <label>
          Price (Rs.)
          <input type="number" value={price} readOnly />
        </label>

        <label>
          Card Holder Name*
          <input
            type="text"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            placeholder="John Doe"
            required
          />
          {errors.cardHolder && <span className="error-msg">{errors.cardHolder}</span>}
        </label>

        {/* Card Type */}
        <div className="card-type-group horizontal">
          <label>
            <input
              type="radio"
              name="cardType"
              value="Visa"
              checked={cardType === "Visa"}
              onChange={() => setCardType("Visa")}
            />
            <img src={visaLogo} alt="Visa" className="card-logo" />
          </label>

          <label>
            <input
              type="radio"
              name="cardType"
              value="MasterCard"
              checked={cardType === "MasterCard"}
              onChange={() => setCardType("MasterCard")}
            />
            <img src={mastercardLogo} alt="MasterCard" className="card-logo" />
          </label>

          <label>
            <input
              type="radio"
              name="cardType"
              value="AmericanExpress"
              checked={cardType === "AmericanExpress"}
              onChange={() => setCardType("AmericanExpress")}
            />
            <img src={americanExpressLogo} alt="American Express" className="card-logo" />
          </label>
        </div>

        <label>
          Card Number*
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
            placeholder="1234567890123456"
            maxLength={16}
            required
          />
          {errors.cardNumber && <span className="error-msg">{errors.cardNumber}</span>}
        </label>

        <div className="card-row">
          <label>
            Expiry Date*
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/YY"
              required
            />
            {errors.expiry && <span className="error-msg">{errors.expiry}</span>}
          </label>

          <label>
            CVV*
            <input
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
              placeholder="123"
              required
            />
            {errors.cvv && <span className="error-msg">{errors.cvv}</span>}
          </label>
        </div>

        <div className="payment-buttons">
          <button type="button" className="demo-btn" onClick={handleDemo}>
            Demo
          </button>

          <button type="submit" className="pay-btn">
            Pay
          </button>
        </div>
      </form>
    </div>
);
};

export default StallPayment;