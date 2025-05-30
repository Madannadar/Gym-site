import express from "express";
import {
  createDietLog,
  getDietLogs,
  getDietLog,
  getUserDietLogs,
  editDietLog,
  removeDietLog,
} from "../controllers/diet_log.controller.js";

const router = express.Router();

// POST /api/diet-logs - create a new diet log
router.post("/", createDietLog);

// GET /api/diet-logs - get all diet logs
router.get("/", getDietLogs);

// GET /api/diet-logs/:id - get a specific diet log by log_id
router.get("/:id", getDietLog);

// GET /api/diet-logs/user/:user_id - get all logs for a user (optional query param: ?log_date=YYYY-MM-DD)
router.get("/user/:user_id", getUserDietLogs);

// PUT /api/diet-logs/:id - update a specific diet log
router.put("/:id", editDietLog);

// DELETE /api/diet-logs/:id - delete a specific diet log
router.delete("/:id", removeDietLog);

export default router;
