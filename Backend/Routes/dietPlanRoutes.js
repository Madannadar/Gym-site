import express from "express";
import {
  createDietPlanController,
  getAllDietPlansController,
  getDietPlanByIdController,
  updateDietPlanController,
  deleteDietPlanController
} from "../controller/dietPlanController.js";

const dietplan = express.Router();

// Route to create a new diet plan
dietplan.post("/diet-plans", createDietPlanController);

// Route to get all diet plans
dietplan.get("/diet-plans", getAllDietPlansController);

// Route to get a single diet plan by ID
dietplan.get("/diet-plans/:id", getDietPlanByIdController);

dietplan.put("/diet-plans/:id", updateDietPlanController);

// Route to delete a diet plan
dietplan.delete("/diet-plans/:id", deleteDietPlanController);

export default dietplan;
