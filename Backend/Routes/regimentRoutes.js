import express from 'express';
import {
  createRegimentController,
  addWorkoutController,
  addExerciseController,
  addSetController,
  getAllRegimentsController
} from '../controller/regimentController.js';

const RegimentRoutes = express.Router();

// Create a new regiment
RegimentRoutes.post('/regiments', createRegimentController);

// Get all regiments with workouts, exercises, and sets
RegimentRoutes.get('/regiments', getAllRegimentsController);

// Add a workout to a specific regiment
RegimentRoutes.post('/regiments/:regimentId/workouts', addWorkoutController);

// Add an exercise to a specific workout
RegimentRoutes.post('/workouts/:workoutId/exercises', addExerciseController);

// Add a set to a specific exercise
RegimentRoutes.post('/exercises/:exerciseId/sets', addSetController);

export default RegimentRoutes;
