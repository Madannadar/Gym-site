import * as ExerciseModel from "../models/exercise.model.js";

export const getAllExercises = async (req, res) => {
  try {
    const exercises = await ExerciseModel.getAllExercises();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getExerciseById = async (req, res) => {
  try {
    const exercise = await ExerciseModel.getExerciseById(req.params.id);
    if (!exercise)
      return res.status(404).json({ message: "Exercise not found" });
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const createExercise = async (req, res) => {
  try {
    const { name, description, calories_burned } = req.body;
    const exercise = await ExerciseModel.createExercise(
      name,
      description,
      calories_burned,
    );
    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateExercise = async (req, res) => {
  try {
    const { name, description, calories_burned } = req.body;
    const exercise = await ExerciseModel.updateExercise(
      req.params.id,
      name,
      description,
      calories_burned,
    );
    if (!exercise)
      return res.status(404).json({ message: "Exercise not found" });
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteExercise = async (req, res) => {
  try {
    const exercise = await ExerciseModel.deleteExercise(req.params.id);
    if (!exercise)
      return res.status(404).json({ message: "Exercise not found" });
    res.json({ message: "Exercise deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
