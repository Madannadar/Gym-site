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
import authenticate from "../middlewares/authenticate.middleware.js";

const router = express.Router();

router.post("/", authenticate, createDietTemplateController);
router.get("/", getAllDietTemplatesController);
router.get("/:id", getDietTemplateByIdController);
router.put("/:id", authenticate, updateDietTemplateController);
router.delete("/:id", authenticate, deleteDietTemplateController);
router.get("/user/:userId", authenticate, getDietTemplatesByUserIdController);
router.delete("/user/:userId", authenticate, deleteAllDietTemplatesByUserIdController);

export default router;
