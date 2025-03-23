import express from "express";
import * as ExerciseController from "../controllers/exercise.controller.js";

const router = express.Router();

router.get("/", ExerciseController.getAllExercises);
router.get("/:id", ExerciseController.getExerciseById);
router.post("/", ExerciseController.createExercise);
router.put("/:id", ExerciseController.updateExercise);
router.delete("/:id", ExerciseController.deleteExercise);

export default router;
