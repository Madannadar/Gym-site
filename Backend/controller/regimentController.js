import {
    createRegiment,
    addWorkoutToRegiment,
    addExerciseToWorkout,
    addSetToExercise,
    getAllRegiments,
    logActualSetPerformance 
  } from '../models/regiment.model.js';
  
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
      const { set_name, reps, weight, weight_label, time, time_label } = req.body;
  
      const newSet = await addSetToExercise({
        exerciseId,
        set_name,
        reps,
        weight,
        weight_label,
        time,
        time_label,
      });
  
      res.status(201).json(newSet);
      console.log(newSet);
      
    } catch (err) {
      console.error("Error adding set:", err);
      res.status(500).json({ error: "Failed to add set" });
    }
  };
  
  export const logActualSetController = async (req, res) => {
    try {
      const { setId } = req.params;
      const {
        userId,
        actualReps,
        actualWeight,
        actualWeightLabel,
        actualTime,
        actualTimeLabel,
      } = req.body;
  
      if (!userId) {
        return res.status(400).json({ error: "Missing userId in request body" });
      }
  
      const log = await logActualSetPerformance({
        setId,
        userId,
        actualReps,
        actualWeight,
        actualWeightLabel,
        actualTime,
        actualTimeLabel,
      });
  
      res.status(201).json(log);
    } catch (err) {
      console.error("Error logging actual set performance:", err);
      res.status(500).json({ error: "Failed to log actual set performance" });
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
  