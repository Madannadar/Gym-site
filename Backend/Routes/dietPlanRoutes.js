import express from "express";
import {
  createDietPlanController,
  getAllDietPlansController,
  getDietPlanByIdController,
} from "../controller/dietPlanController.js";

const router = express.Router();

// Route to create a new diet plan
router.post("/diet-plans", createDietPlanController);

// Route to get all diet plans
router.get("/diet-plans", getAllDietPlansController);

// Route to get a single diet plan by ID
router.get("/diet-plans/:id", getDietPlanByIdController);

export default router;
