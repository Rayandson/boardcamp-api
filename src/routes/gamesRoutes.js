import { Router } from "express"
import { create, findAll } from "../controllers/gamesController.js";

const router = Router();

router.get("/games", findAll);
router.post("/games", create); 

export default router; 