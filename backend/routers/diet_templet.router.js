// routes/dietTemplate.routes.js
import express from "express";
import {
  createDietTemplateController,
  getAllDietTemplatesController,
  getDietTemplateByIdController,
  updateDietTemplateController,
  deleteDietTemplateController,
  getDietTemplatesByUserIdController,
  deleteAllDietTemplatesByUserIdController,
} from "../controllers/diet_template.controller.js";

const router = express.Router();

// POST: Create a new diet template
router.post("/", createDietTemplateController);

// GET: Fetch all diet templates
router.get("/", getAllDietTemplatesController);

// GET: Fetch a single diet template by ID
router.get("/:id", getDietTemplateByIdController);

// PUT: Update a diet template by ID
router.put("/:id", updateDietTemplateController);

// DELETE: Delete a diet template by ID
router.delete("/:id", deleteDietTemplateController);

// GET: Fetch all templates created by a specific user
router.get("/user/:userId", getDietTemplatesByUserIdController);

// DELETE: Delete all templates created by a specific user
router.delete("/user/:userId", deleteAllDietTemplatesByUserIdController);

export default router;
