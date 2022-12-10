import { Router } from "express"
import { create, findAll } from "../controllers/categoriesController.js";

const router = Router();

router.get("/categories", findAll);
router.post("/categories", create); 

export default router; 