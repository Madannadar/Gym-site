import express from "express";
import {
  createDietLog,
  getDietLogs,
  getDietLog,
  getUserDietLogs,
  editDietLog,
  removeDietLog,
  createDishAndLog,
} from "../controllers/diet_log.controller.js";
import authenticate from "../middlewares/authenticate.middleware.js";

const router = express.Router();

// POST /api/diet-logs - create a new diet log
router.post("/", authenticate, createDietLog);
router.post("/add", authenticate, createDishAndLog); // Correct endpoint
router.get("/", getDietLogs);
router.get("/:id", getDietLog);
router.get("/user/:user_id", getUserDietLogs);
router.put("/:id", authenticate, editDietLog);
router.delete("/:id", authenticate, removeDietLog);

export default router;
