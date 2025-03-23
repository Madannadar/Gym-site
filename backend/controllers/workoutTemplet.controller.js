import * as WorkoutTemplateModel from "../models/workoutTemplet.model.js";

export const getAllWorkoutTemplates = async (req, res) => {
  try {
    const templates = await WorkoutTemplateModel.getAllWorkoutTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getWorkoutTemplateById = async (req, res) => {
  try {
    const template = await WorkoutTemplateModel.getWorkoutTemplateById(
      req.params.id,
    );
    if (!template)
      return res.status(404).json({ message: "Workout Template not found" });
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const createWorkoutTemplate = async (req, res) => {
  try {
    const { name, description, cover_image, difficulty, duration } = req.body;
    const template = await WorkoutTemplateModel.createWorkoutTemplate(
      name,
      description,
      cover_image,
      difficulty,
      duration,
    );
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateWorkoutTemplate = async (req, res) => {
  try {
    const { name, description, cover_image, difficulty, duration } = req.body;
    const template = await WorkoutTemplateModel.updateWorkoutTemplate(
      req.params.id,
      name,
      description,
      cover_image,
      difficulty,
      duration,
    );
    if (!template)
      return res.status(404).json({ message: "Workout Template not found" });
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteWorkoutTemplate = async (req, res) => {
  try {
    const template = await WorkoutTemplateModel.deleteWorkoutTemplate(
      req.params.id,
    );
    if (!template)
      return res.status(404).json({ message: "Workout Template not found" });
    res.json({ message: "Workout Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
