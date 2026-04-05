import express from "express";
import { createClub, viewAllClubs ,updateEvent} from "../controllers/clubController.js";

const router = express.Router();

router.post("/create", createClub);
router.get("/viewall",viewAllClubs);
// Update other event details
router.put("/:id", updateEvent);



export default router;