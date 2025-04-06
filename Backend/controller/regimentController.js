import {
    createRegiment,
    addWorkoutToRegiment,
    addExerciseToWorkout,
    addSetToExercise,
    getAllRegiments,
  } from '../models/regiment.js';
  
  export const createRegimentController = async (req, res) => {
    try {
      const { name } = req.body;
      const regiment = await createRegiment(name);
      res.status(201).json(regiment);
    } catch (err) {
      console.error("Error creating regiment:", err);
      res.status(500).json({ error: "Failed to create regiment" });
    }
  };
  
  export const addWorkoutController = async (req, res) => {
    try {
      const { regimentId } = req.params;
      const { name } = req.body;
      const workout = await addWorkoutToRegiment(regimentId, name);
      res.status(201).json(workout);
    } catch (err) {
      console.error("Error adding workout:", err);
      res.status(500).json({ error: "Failed to add workout" });
    }
  };
  
  export const addExerciseController = async (req, res) => {
    try {
      const { workoutId } = req.params;
      const { name } = req.body;
      const exercise = await addExerciseToWorkout(workoutId, name);
      res.status(201).json(exercise);
    } catch (err) {
      console.error("Error adding exercise:", err);
      res.status(500).json({ error: "Failed to add exercise" });
    }
  };
  
  export const addSetController = async (req, res) => {
    try {
      const { exerciseId } = req.params;
      const { setName, unitType, value } = req.body;
      const newSet = await addSetToExercise({ exerciseId, setName, unitType, value });
      res.status(201).json(newSet);
    } catch (err) {
      console.error("Error adding set:", err);
      res.status(500).json({ error: "Failed to add set" });
    }
  };
  
  export const getAllRegimentsController = async (req, res) => {
    try {
      const regiments = await getAllRegiments();
      res.status(200).json(regiments);
    } catch (err) {
      console.error("Error fetching regiments:", err);
      res.status(500).json({ error: "Failed to get regiments" });
    }
  };
  