import express from "express";
import {
  createClub,
  updateEvent,
  getAllClubs,
  deleteClub,
} from "../controllers/clubController.js";

const router = express.Router();

router.post("/create", createClub);
router.put("/:id", updateEvent);
router.get("/", getAllClubs);
router.delete("/:id", deleteClub);

export default router;