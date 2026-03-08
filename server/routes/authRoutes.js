import { Router } from "express";
import { commonLogin } from "../controllers/commonAuthController.js";

const router = Router();

router.post("/login", commonLogin);

export default router;