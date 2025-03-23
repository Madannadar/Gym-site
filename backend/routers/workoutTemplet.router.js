import express from "express";
import {
  getAllWorkoutTemplates,
  getWorkoutTemplateById,
  createWorkoutTemplate,
  updateWorkoutTemplate,
  deleteWorkoutTemplate,
} from "../controllers/workoutTemplet.controller.js";

const router = express.Router();

router.get("/", getAllWorkoutTemplates);
router.get("/:id", getWorkoutTemplateById);
router.post("/", createWorkoutTemplate);
router.put("/:id", updateWorkoutTemplate);
router.delete("/:id", deleteWorkoutTemplate);

export default router;
