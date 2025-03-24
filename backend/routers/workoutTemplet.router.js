import express from "express";
import {
  getAllWorkoutTemplates,
  getWorkoutTemplate,
  createOrUpdateWorkoutTemplate,
  deleteWorkoutTemplate,
} from "../controllers/workoutTemplet.controller.js";

const workoutTempletRouter = express.Router();

workoutTempletRouter.get("/", getAllWorkoutTemplates); //works

workoutTempletRouter.get("/:id", getWorkoutTemplate); //works

workoutTempletRouter.post("/", createOrUpdateWorkoutTemplate); // works
workoutTempletRouter.put("/:id", createOrUpdateWorkoutTemplate); //works

workoutTempletRouter.delete("/:id", deleteWorkoutTemplate); //works

export default workoutTempletRouter;
