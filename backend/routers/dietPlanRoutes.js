import express from "express";
import {
  createDietPlanController,
  getAllDietPlansController,
  getDietPlanByIdController,
} from "../controllers/dietPlanController.js";

const dietplanRouter = express.Router();

// Route to create a new diet plan
dietplanRouter.post("/", createDietPlanController);

// Route to get all diet plans
dietplanRouter.get("/", getAllDietPlansController);

// Route to get a single diet plan by ID
dietplanRouter.get("/:id", getDietPlanByIdController);

export default dietplanRouter;
