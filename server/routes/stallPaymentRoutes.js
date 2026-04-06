import express from "express";
import { payForStall, listPayments } from "../controllers/stallPaymentController.js";

const router = express.Router();

// Pay for a stall booking
router.post("/pay", payForStall);

// List all payments
router.get("/", listPayments);

export default router;