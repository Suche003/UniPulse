import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";

// Import routes
import studentRoutes from "./routes/studentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import sponsorRoutes from './routes/sponsorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import sponsorshipRoutes from './routes/sponsorshipRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import offeringRoutes from './routes/offeringRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import paymentGatewayRoutes from './routes/paymentGatewayRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js'; // ✅ NEW

import { errorHandler } from "./middleware/errorHandler.js";
import { handleStripeWebhook } from "./controllers/paymentGatewayController.js";

// Import models to ensure they are registered
import './models/Sponsor.js';
import './models/Event.js';
import './models/SponsorshipPackage.js';
import './models/SponsorshipRequest.js';
import './models/Payment.js';
import './models/SponsorOffering.js';
import './models/Notification.js'; // ✅ NEW

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));

// IMPORTANT: Stripe webhook endpoint must use raw body before express.json()
app.post('/api/payment-gateway/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json());

// Static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => res.send("UniPulse API running ✅"));

// Register routes
app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/sponsorship-requests', sponsorshipRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/offerings', offeringRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payment-gateway', paymentGatewayRoutes);
app.use('/api/notifications', notificationRoutes); // ✅ NEW

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
});