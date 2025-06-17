import express from "express";
import {
  getAllDishesController,
  getDishByIdController,
  updateDishController,
  deleteDishController,
  getDishesByUserIdController,
  deleteAllDishesByUserIdController,
  createDishController,
  createDishAndLog,
  getDishByNameController,
} from "../controllers/dish.controller.js";
import authenticate from "../middlewares/authenticate.middleware.js";

const router = express.Router();

// Routes
router.post("/add", authenticate, createDishAndLog);
router.post("/", authenticate, createDishController);
router.get("/", getAllDishesController);
router.get("/dishes_id", getDishByNameController); // New endpoint for name query
router.get("/:id", getDishByIdController);
router.put("/:id", authenticate, updateDishController);
router.delete("/:id", authenticate, deleteDishController);
router.get("/user/:userId", authenticate, getDishesByUserIdController);
router.delete("/user/:userId", authenticate, deleteAllDishesByUserIdController);

export default router;
