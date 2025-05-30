import express from "express";
import {
  recordUserDietTemplate,
  fetchAllDietTemplates,
  fetchDietTemplateById,
  updateDietTemplateById,
  deleteDietTemplateById,
  fetchUserDietTemplates,
  deleteUserDietTemplates,
} from "../controllers/diet_template.controller.js";

const router = express.Router();

// POST /api/diet-templates - create a new diet template
router.post("/", recordUserDietTemplate);

// GET /api/diet-templates - fetch all diet templates
router.get("/", fetchAllDietTemplates);

// GET /api/diet-templates/:id - fetch a single diet template by ID
router.get("/:id", fetchDietTemplateById);

// PUT /api/diet-templates/:id - update a diet template by ID
router.put("/:id", updateDietTemplateById);

// DELETE /api/diet-templates/:id - delete a diet template by ID
router.delete("/:id", deleteDietTemplateById);

// GET /api/diet-templates/user/:userId - fetch all templates created by a specific user
router.get("/user/:userId", fetchUserDietTemplates);

// DELETE /api/diet-templates/user/:userId - delete all templates created by a specific user
router.delete("/user/:userId", deleteUserDietTemplates);

export default router;
