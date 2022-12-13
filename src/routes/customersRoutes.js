import { Router } from "express"
import { create, findAll, findById, update } from "../controllers/customersController.js";

const router = Router();

router.get("/customers", findAll);
router.get("/customers/:id", findById);
router.post("/customers", create);  
router.put("/customers/:id", update);  

export default router; 