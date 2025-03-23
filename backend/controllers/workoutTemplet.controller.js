import {
  getAllTemplates,
  getTemplateById,
  createOrUpdateTemplate,
  deleteTemplate,
} from "../models/workoutTemplet.model.js";

// 📌 Get all workout templates
export const getAllWorkoutTemplates = async (req, res) => {
  try {
    const templates = await getAllTemplates();
    res.status(200).json(templates);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching workout templates", error });
  }
};

// 📌 Get a specific workout template
export const getWorkoutTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await getTemplateById(id);
    if (!template)
      return res.status(404).json({ message: "Workout template not found" });
    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workout template", error });
  }
};

// 📌 Create or update a workout template (also handles adding/removing exercises)
export const createOrUpdateWorkoutTemplate = async (req, res) => {
  try {
    const { id } = req.params; // If provided, update; otherwise, create
    const { name, description, cover_image, difficulty, duration, exercises } =
      req.body;

    const template = await createOrUpdateTemplate({
      id,
      name,
      description,
      cover_image,
      difficulty,
      duration,
      exercises,
    });

    res.status(id ? 200 : 201).json({
      message: id
        ? "Workout template updated successfully"
        : "Workout template created successfully",
      template,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing workout template", error });
  }
};

// 📌 Delete a workout template
export const deleteWorkoutTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteTemplate(id);
    res.status(200).json({ message: "Workout template deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting workout template", error });
  }
};
