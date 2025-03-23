import express from "express";
import * as ExerciseController from "../controllers/exercise.controller.js";

const exerciseRouter = express.Router();

exerciseRouter.get("/", ExerciseController.getAllExercises); //works
exerciseRouter.get("/:id", ExerciseController.getExerciseById); //works
exerciseRouter.post("/", ExerciseController.createExercise); //works
exerciseRouter.put("/:id", ExerciseController.updateExercise); //works
exerciseRouter.delete("/:id", ExerciseController.deleteExercise); //works

export default exerciseRouter;
