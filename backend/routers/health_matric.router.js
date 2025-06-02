import { Router } from "express";
import {
  addLog,
  getLogs,
  updateLog,
  deleteLog,
  getSingleLog,
} from "../controllers/health_matric.controller.js";

const router = Router();

//all works

// POST /health-matric
router.post("/", addLog);

// GET /health-matric/:type/:user_id → Get last 5 bmi/weight logs
router.get("/:type/:user_id", getLogs);

// GET /health-matric/entry/:log_id/:user_id → Get single log
router.get("/entry/:log_id/:user_id", getSingleLog);

// PUT /health-matric/:log_id/:user_id
router.put("/:log_id/:user_id", updateLog);

// DELETE /health-matric/:log_id/:user_id
router.delete("/:log_id/:user_id", deleteLog);

export default router;
