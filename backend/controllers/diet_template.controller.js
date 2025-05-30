import {
  recordDietTemplate,
  fetchAllDietTemplates,
  fetchDietTemplateById,
  updateDietTemplateById,
  deleteDietTemplateById,
  fetchDietTemplatesByUserId,
  deleteAllDietTemplatesByUserId,
} from "../models/diet_template.model.js";

const recordUserDietTemplate = async (req, res) => {
  try {
    const template = await recordDietTemplate(req.body);
    res.status(201).json({ template });
  } catch (err) {
    console.error("❌ Failed to record template:", err.stack);
    res.status(500).json({ error: "Failed to record template." });
  }
};

const fetchAllDietTemplates = async (req, res) => {
  try {
    const templates = await fetchAllDietTemplates();
    res.status(200).json({ templates });
  } catch (err) {
    console.error("❌ Failed to fetch templates:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchDietTemplateById = async (req, res) => {
  const { id } = req.params;
  try {
    const template = await fetchDietTemplateById(id);
    if (!template) return res.status(404).json({ error: "Template not found" });
    res.status(200).json({ template });
  } catch (err) {
    console.error("❌ Failed to fetch template:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateDietTemplateById = async (req, res) => {
  const { id } = req.params;
  try {
    const template = await updateDietTemplateById(id, req.body);
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

const deleteDietTemplateById = async (req, res) => {
  const { id } = req.params;
  try {
    const template = await deleteDietTemplateById(id);
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

const fetchUserDietTemplates = async (req, res) => {
  const { userId } = req.params;
  try {
    const templates = await fetchDietTemplatesByUserId(userId);
    res.status(200).json({ templates });
  } catch (err) {
    console.error("❌ Failed to fetch templates by user:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteUserDietTemplates = async (req, res) => {
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
  recordUserDietTemplate,
  fetchAllDietTemplates,
  fetchDietTemplateById,
  updateDietTemplateById,
  deleteDietTemplateById,
  fetchUserDietTemplates,
  deleteUserDietTemplates,
};
