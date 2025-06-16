import { Router } from "express";
import {
  addLog,
  getLogs,
  updateLog,
  deleteLog,
  getSingleLog,
} from "../controllers/health_matric.controller.js";
import authenticate from "../middlewares/authenticate.middleware.js";

const router = Router();

router.post("/", authenticate, addLog);
router.get("/:type/:user_id", authenticate, getLogs);
router.get("/entry/:log_id/:user_id", authenticate, getSingleLog);
router.put("/:log_id/:user_id", authenticate, updateLog);
router.delete("/:log_id/:user_id", authenticate, deleteLog);

export default router;
