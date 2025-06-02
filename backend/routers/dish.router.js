import express from "express";
import {
  getAllDishesController,
  getDishByIdController,
  updateDishController,
  deleteDishController,
  getDishesByUserIdController,
  deleteAllDishesByUserIdController,
  createDishController,
} from "../controllers/dish.controller.js";

const router = express.Router();

//all routes work here as expected

// Create a new dish
router.post("/", createDishController);

// Get all dishes
router.get("/", getAllDishesController);

// Get a dish by ID
router.get("/:id", getDishByIdController);

// Update a dish by ID
router.put("/:id", updateDishController);

// Delete a dish by ID
router.delete("/:id", deleteDishController);

// Get all dishes created by a specific user
router.get("/user/:userId", getDishesByUserIdController);

// Delete all dishes created by a specific user
router.delete("/user/:userId", deleteAllDishesByUserIdController);

export default router;
