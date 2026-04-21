import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";

// Debug models
import Club from "./models/Club.js";
import Event from "./models/Event.js";

// Import routes
import studentDashboardRoutes from "./routes/studentDashboardRoutes.js";
import studentEventRoutes from "./routes/studentEventRoutes.js";
import studentTicketRoutes from "./routes/studentTicketRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

import studentProfileRoutes from "./routes/studentProfileRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

import vendorRoutes from "./routes/vendorRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import sponsorRoutes from "./routes/sponsorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import sponsorshipRoutes from "./routes/sponsorshipRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import offeringRoutes from "./routes/offeringRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import paymentGatewayRoutes from "./routes/paymentGatewayRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import clubRoutes from "./routes/clubRoute.js";

import stallRoutes from "./routes/stallRoutes.js";
import bookingStallRoutes from "./routes/bookingStallRoutes.js";
import stallPaymentRoutes from "./routes/stallPaymentRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { handleStripeWebhook } from "./controllers/paymentGatewayController.js";

// Import models to ensure they are registered
import "./models/Sponsor.js";
import "./models/Event.js";
import "./models/SponsorshipPackage.js";
import "./models/SponsorshipRequest.js";
import "./models/Payment.js";
import "./models/SponsorOffering.js";
import "./models/Notification.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IMPORTANT: Stripe webhook endpoint must use raw body
app.post(
  "/api/payment-gateway/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// Student routes
app.use("/api/student", studentDashboardRoutes);
app.use("/api/student", studentEventRoutes);
app.use("/api/student", studentTicketRoutes);

// Feedback routes
app.use("/api/feedback", feedbackRoutes);

// Static files for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => res.send("UniPulse API running ✅"));

app.get("/api/debug/club-check/:id", async (req, res) => {
  try {
    const id = req.params.id;

    let event = null;

    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      event = await Event.findById(id);
    }

    if (!event) {
      event = await Event.findOne({ eventid: id });
    }

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const clubs = await Club.find().select("clubName clubid");

    const rawClubId = String(event?.clubid || "");
    const cleanClubId = rawClubId.trim().toUpperCase();

    const matchedClub = clubs.find(
      (club) =>
        String(club.clubid || "").trim().toUpperCase() === cleanClubId
    );

    return res.json({
      eventMongoId: event._id,
      eventId: event.eventid,
      rawClubId,
      cleanClubId,
      allClubs: clubs,
      matchedClub: matchedClub || null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Debug route failed",
      error: error.message,
    });
  }
});

// Register routes
app.use("/api/students", studentProfileRoutes);
app.use("/api/students", studentRoutes);


app.use("/api/vendors", vendorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/sponsors", sponsorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/sponsorship-requests", sponsorshipRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/offerings", offeringRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payment-gateway", paymentGatewayRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stalls", stallRoutes);
app.use("/api/bookings", bookingStallRoutes);
app.use("/api/stall-payment", stallPaymentRoutes);

// Clubs
app.use("/api/clubs", clubRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () =>
    console.log(`✅ Server running on http://localhost:${PORT}`)
  );
});