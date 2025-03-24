import express from "express";
import {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} from "../controllers/exercise.controller.js";

const exerciseRouter = express.Router();

exerciseRouter.get("/", getAllExercises); //works
exerciseRouter.get("/:id", getExerciseById); //works
exerciseRouter.post("/", createExercise); //works
exerciseRouter.put("/:id", updateExercise); //works
exerciseRouter.delete("/:id", deleteExercise); //works

export default exerciseRouter;
