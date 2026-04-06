import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import studentRoutes from "./routes/studentRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import stallRoutes from "./routes/stallRoutes.js";
import bookingStallRoutes from "./routes/bookingStallRoutes.js"; 
import stallPaymentRoutes from "./routes/stallPaymentRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import studentProfileRoutes from "./routes/studentProfileRoutes.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => res.send("UniPulse API running ✅"));

app.use("/api/students", studentRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stalls", stallRoutes);
app.use("/api/bookings", bookingStallRoutes); 
app.use("/api/stall-payment", stallPaymentRoutes);

app.use(errorHandler);

app.use("/api/students", studentProfileRoutes);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
});