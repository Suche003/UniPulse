import express from "express";
import {
  createStall,
  getStalls,
  getStallById,
  updateStall,
  deleteStall,
  getAllStalls 
} from "../controllers/stallController.js";

const router = express.Router();

// GET ALL STALLS (across all events)
router.get("/", getAllStalls);

// GET ALL STALLS for a specific event
router.get("/event/:eventid", getStalls);

// GET SINGLE STALL by ID
router.get("/event/:eventid/:id", getStallById);

// CREATE STALL for an event
router.post("/event/:eventid", createStall);

// UPDATE STALL (stallId cannot be changed)
router.put("/event/:eventid/:id", updateStall);

// DELETE STALL
router.delete("/event/:eventid/:id", deleteStall);

export default router;