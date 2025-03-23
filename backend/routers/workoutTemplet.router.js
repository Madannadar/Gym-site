import express from "express";
import {
  getAllWorkoutTemplates,
  getWorkoutTemplate,
  createOrUpdateWorkoutTemplate,
  deleteWorkoutTemplate,
} from "../controllers/workoutTemplet.controller.js";

const router = express.Router();

// 📌 Get all workout templates
router.get("/", getAllWorkoutTemplates);

// 📌 Get a specific workout template by ID
router.get("/:id", getWorkoutTemplate);

// 📌 Create or update a workout template (also handles adding/removing exercises)
router.post("/", createOrUpdateWorkoutTemplate);
router.put("/:id", createOrUpdateWorkoutTemplate);

// 📌 Delete a workout template
router.delete("/:id", deleteWorkoutTemplate);

export default router;
