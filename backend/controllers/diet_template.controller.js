import {
  insertDietTemplateModel,
  getAllDietTemplatesModel,
  getDietTemplateByIdModel,
  updateDietTemplateModel,
  deleteDietTemplateByIdModel,
  getDietTemplatesByUserIdModel,
  deleteAllDietTemplatesByUserIdModel,
} from "../model/diet_template.model.js";
import db from "../config/db.js";

const createDietTemplateController = async (req, res) => {
  try {
    const { created_by } = req.body;
    if (created_by) {
      const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [
        created_by,
      ]);
      if (userCheck.rows.length === 0) {
        return res
          .status(400)
          .json({ error: "Invalid user ID: User does not exist" });
      }
    }
    const template = await insertDietTemplateModel(req.body);
    res.status(201).json({ template });
  } catch (err) {
    console.error("❌ Failed to insert template:", err.stack);
    res.status(500).json({ error: "Failed to insert template." });
  }
};

const getAllDietTemplatesController = async (req, res) => {
  try {
    const templates = await getAllDietTemplatesModel();
    res.status(200).json({ templates });
  } catch (err) {
    console.error("❌ Failed to fetch templates:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getDietTemplateByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const template = await getDietTemplateByIdModel(id);
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
    const template = await updateDietTemplateModel(id, req.body);
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
    const template = await deleteDietTemplateByIdModel(id);
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
    console.log(`🔍 Fetching templates for userId: ${userId}`);
    const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [
      userId,
    ]);
    if (userCheck.rows.length === 0) {
      console.error(`❌ Invalid user ID: ${userId}`);
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const templates = await getDietTemplatesByUserIdModel(userId);
    console.log(`✅ Templates found: ${templates.length}`);
    res.status(200).json({ templates });
  } catch (err) {
    console.error("❌ Failed to fetch templates by user:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteAllDietTemplatesByUserIdController = async (req, res) => {
  const { userId } = req.params;
  try {
    const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [
      userId,
    ]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const templates = await deleteAllDietTemplatesByUserIdModel(userId);
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
