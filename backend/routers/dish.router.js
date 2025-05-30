import express from "express";
import {
  recordUserDish,
  fetchAllDishes,
  fetchDishById,
  updateDishById,
  deleteDishById,
  fetchUserDishes,
  deleteUserDishes,
} from "../controllers/dish.controller.js";

const router = express.Router();

// POST /api/dishes - create a new dish
router.post("/", recordUserDish);

// GET /api/dishes - fetch all dishes
router.get("/", fetchAllDishes);

// GET /api/dishes/:id - fetch a dish by ID
router.get("/:id", fetchDishById);

// PUT /api/dishes/:id - update a dish by ID
router.put("/:id", updateDishById);

// DELETE /api/dishes/:id - delete a dish by ID
router.delete("/:id", deleteDishById);

// GET /api/dishes/user/:userId - fetch all dishes created by a specific user
router.get("/user/:userId", fetchUserDishes);

// DELETE /api/dishes/user/:userId - delete all dishes created by a specific user
router.delete("/user/:userId", deleteUserDishes);

export default router;
