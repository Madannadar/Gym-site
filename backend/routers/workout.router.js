import express from "express";
import {
  recordExerciseEntry,
  fetchAllExercisesList,
  fetchExerciseByIdEntry,
  updateExerciseByIdEntry,
  deleteExerciseByIdEntry,
  recordWorkoutEntry,
  fetchAllWorkoutsList,
  fetchWorkoutByIdEntry,
  updateWorkoutByIdEntry,
  deleteWorkoutByIdEntry,
  recordWorkoutLogEntry,
  fetchUserWorkoutLogsList,
  fetchWorkoutLogByIdEntry,
  updateWorkoutLogByIdEntry,
  deleteWorkoutLogByIdEntry,
  recordRegimentEntry,
  fetchAllRegimentsList,
  fetchRegimentByIdEntry,
  updateRegimentByIdEntry,
  deleteRegimentByIdEntry,
  getHighestIntensityWorkout,
} from "../controllers/workout.controller.js"
import { deleteCurrentRegimentFromStatus, getCurrentRegimentForUser, setCurrentRegiment } from "../model/workout.model.js";
// import { getCurrentRegimentForUser, recordProgress } from "../model/workout.model.js";

const router = express.Router();

// Exercise Routes
// POST /api/workouts/exercises - create a new exercise
router.post("/exercises", recordExerciseEntry); // working  // frontend too 
// GET /api/workouts/exercises - fetch all exercises
router.get("/exercises", fetchAllExercisesList); // working
// GET /api/workouts/exercises/:id - fetch an exercise by ID
router.get("/exercises/:id", fetchExerciseByIdEntry); // working
// PUT /api/workouts/exercises/:id - update an exercise
router.put("/exercises/:id", updateExerciseByIdEntry); // working
// DELETE /api/workouts/exercises/:id - delete an exercise
router.delete("/exercises/:id", deleteExerciseByIdEntry); // working

//Express matches routes top to bottom, so if a dynamic param route (/:workoutId) is defined first, it will catch all requests, including /regiments.

// Regiment Routes(static routes)
// POST /api/workouts/regiments - create a new regiment
router.post("/regiments", recordRegimentEntry); // working  // checks if workout exists before adding to regiment
// GET /api/workouts/regiments - fetch all regiments
router.get("/regiments", fetchAllRegimentsList); // working
// GET /api/workouts/regiments/:id - fetch a regiment by ID
router.get("/regiments/:id", fetchRegimentByIdEntry); // working
// PUT /api/workouts/regiments/:id - update a regiment
router.put("/regiments/:id", updateRegimentByIdEntry); // working
// DELETE /api/workouts/regiments/:id - delete a regiment
router.delete("/regiments/:id", deleteRegimentByIdEntry); // working

// Workout Routes
// POST /api/workouts - create a new workout
router.post("/", recordWorkoutEntry); // working  // checks if exercise exists before adding to workout
// GET /api/workouts - fetch all workouts
router.get("/", fetchAllWorkoutsList); // working
// GET /api/workouts/:id - fetch a workout by ID
router.get("/:id", fetchWorkoutByIdEntry); // working
// PUT /api/workouts/:id - update a workout
router.put("/:id", updateWorkoutByIdEntry); // working
// DELETE /api/workouts/:id - delete a workout
router.delete("/:id", deleteWorkoutByIdEntry); // working

// Workout Log Routes
// POST /api/workouts/logs - create a new workout log
router.post("/logs", recordWorkoutLogEntry); // working  // checks if regiment, workout, exercies exists before adding to log
// GET /api/workouts/logs/user/:userId - fetch workout logs by user
router.get("/logs/user/:userId", fetchUserWorkoutLogsList);
// GET /api/workouts/logs/:id - fetch a workout log by ID
router.get("/logs/:id", fetchWorkoutLogByIdEntry); // working
// PUT /api/workouts/logs/:id - update a workout log
router.put("/logs/:id", updateWorkoutLogByIdEntry); // working
// DELETE /api/workouts/logs/:id - delete a workout log
router.delete("/logs/:id", deleteWorkoutLogByIdEntry); // working

router.post("/user_current_regiment", setCurrentRegiment)
router.get("/user_current_regiment/:id", getCurrentRegimentForUser);
router.delete("/user_current_regiment/:id",deleteCurrentRegimentFromStatus);


// router.post("/progress",recordProgress)

// router.get("/current-regiment/:user_id", getCurrentRegimentForUser);

// GET /api/workouts/logs/highest-intensity/:userId - fetch highest intensity workout for user
router.get("/logs/highest-intensity/:userId", getHighestIntensityWorkout);

export default router;
