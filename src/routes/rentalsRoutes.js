import { Router } from "express"
import { create, findAll, update, remove} from "../controllers/rentalsController.js";

const router = Router();

router.get("/rentals", findAll);
router.post("/rentals", create);  
router.post("/rentals/:id/return", update);  
router.delete("/rentals/:id", remove);

export default router;  