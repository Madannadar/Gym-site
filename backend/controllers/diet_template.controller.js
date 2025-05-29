import {
  insertDietTemplate,
  getAllDietTemplates,
  getDietTemplateById,
  updateDietTemplate,
  deleteDietTemplate,
  getDietTemplatesByUserId,
  deleteAllDietTemplatesByUserId,
} from "../models/dietTemplate.model.js";

const createDietTemplateController = async (req, res) => {
  try {
    const template = await insertDietTemplate(req.body);
    res.status(201).json({ template });
  } catch (err) {
    console.error("❌ Failed to insert template:", err.stack);
    res.status(500).json({ error: "Failed to insert template." });
  }
};

const getAllDietTemplatesController = async (req, res) => {
  try {
    const templates = await getAllDietTemplates();
    res.status(200).json({ templates });
  } catch (err) {
    console.error("❌ Failed to fetch templates:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getDietTemplateByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const template = await getDietTemplateById(id);
    if (!template) return res.status(404).json({ error: "Template not found" });
    res.status(200).json({ template });
  } catch (err) {
    console.error("❌ Failed to fetch template:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateDietTemplateController = async (req, res) => {
  const { id } = req.params;
  try {
    const template = await updateDietTemplate(id, req.body);
    if (!template)
      return res
        .status(404)
        .json({ error: "Template not found or not updated" });
    res.status(200).json({ template });
  } catch (err) {
    console.error("❌ Failed to update template:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteDietTemplateController = async (req, res) => {
  const { id } = req.params;
  try {
    const template = await deleteDietTemplate(id);
    if (!template)
      return res
        .status(404)
        .json({ error: "Template not found or already deleted" });
    res
      .status(200)
      .json({ message: "Template deleted successfully", template });
  } catch (err) {
    console.error("❌ Failed to delete template:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getDietTemplatesByUserIdController = async (req, res) => {
  const { userId } = req.params;
  try {
    const templates = await getDietTemplatesByUserId(userId);
    res.status(200).json({ templates });
  } catch (err) {
    console.error("❌ Failed to fetch templates by user:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteAllDietTemplatesByUserIdController = async (req, res) => {
  const { userId } = req.params;
  try {
    const templates = await deleteAllDietTemplatesByUserId(userId);
    res
      .status(200)
      .json({ message: "Templates deleted successfully", templates });
  } catch (err) {
    console.error("❌ Failed to delete templates by user:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export {
  createDietTemplateController,
  getAllDietTemplatesController,
  getDietTemplateByIdController,
  updateDietTemplateController,
  deleteDietTemplateController,
  getDietTemplatesByUserIdController,
  deleteAllDietTemplatesByUserIdController,
};
