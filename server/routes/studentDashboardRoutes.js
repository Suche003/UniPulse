import express from "express";
import { getStudentDashboard } from "../controllers/studentDashboardController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", requireAuth, getStudentDashboard);

export default router;