import express from "express";
import { createClub,updateEvent,getAllClubs} from "../controllers/clubController.js";

const router = express.Router();

router.post("/create", createClub);
// Update other event details
router.put("/:id", updateEvent);

//get All Clubs
router.get("/", getAllClubs);



export default router;