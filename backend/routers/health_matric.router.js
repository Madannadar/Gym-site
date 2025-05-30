import express from "express";
import {
  recordHealthLogEntry,
  fetchRecentHealthLogsByType,
  updateHealthLogByIdEntry,
  deleteHealthLogByIdEntry,
  fetchHealthLogByIdEntry,
} from "../controllers/health_matric.controller.js";

const router = express.Router();

// POST /api/health-metrics - create a new health log
router.post("/", recordHealthLogEntry);

// GET /api/health-metrics/:type/:user_id - fetch recent health logs by type and user
router.get("/:type/:user_id", fetchRecentHealthLogsByType);

// GET /api/health-metrics/entry/:log_id/:user_id - fetch a single health log
router.get("/entry/:log_id/:user_id", fetchHealthLogByIdEntry);

// PUT /api/health-metrics/:log_id/:user_id - update a health log
router.put("/:log_id/:user_id", updateHealthLogByIdEntry);

// DELETE /api/health-metrics/:log_id/:user_id - delete a health log
router.delete("/:log_id/:user_id", deleteHealthLogByIdEntry);

export default router;
