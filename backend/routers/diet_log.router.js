import express from "express";
import {
  recordUserDietLog,
  fetchAllDietLogs,
  fetchDietLogById,
  fetchUserDietLogs,
  updateDietLogById,
  deleteDietLogById,
} from "../controllers/diet_log.controller.js";

const router = express.Router();

// POST /api/diet-logs - create a new diet log
router.post("/", recordUserDietLog);

// GET /api/diet-logs - get all diet logs
router.get("/", fetchAllDietLogs);

// GET /api/diet-logs/:id - get a specific diet log by log_id
router.get("/:id", fetchDietLogById);

// GET /api/diet-logs/user/:user_id - get all logs for a user (optional query param: ?log_date=YYYY-MM-DD)
router.get("/user/:user_id", fetchUserDietLogs);

// PUT /api/diet-logs/:id - update a specific diet log
router.put("/:id", updateDietLogById);

// DELETE /api/diet-logs/:id - delete a specific diet log
router.delete("/:id", deleteDietLogById);

export default router;
