import express from "express";
import {
  createStall,
  getStalls,
  getStallById,   
  updateStall,
  deleteStall
} from "../controllers/stallController.js";

const router = express.Router();

// Routes tied to a specific event via :eventid
router.get("/:eventid", getStalls);              
router.get("/:eventid/:id", getStallById);       
router.post("/:eventid", createStall);           
router.put("/:eventid/:id", updateStall);        
router.delete("/:eventid/:id", deleteStall);     

export default router;