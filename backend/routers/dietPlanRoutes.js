import express from "express";
import {
  createDietPlanController,
  getAllDietPlansController,
  getDietPlanByIdController,
} from "../controllers/dietPlanController.js";

const dietplanRouter = express.Router();

// Route to create a new diet plan
dietplanRouter.post("/diet-plans", createDietPlanController);

// Route to get all diet plans
dietplanRouter.get("/diet-plans", getAllDietPlansController);

// Route to get a single diet plan by ID
dietplanRouter.get("/diet-plans/:id", getDietPlanByIdController);

export default dietplanRouter;
