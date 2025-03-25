import express from 'express';
import {
  createFood,
  getAllFoods,
  getFoodById,
  updateFood,
  deleteFood
} from '../controllers/foodController.js'

const FoodRoutes = express.Router();

// Create a new food item
FoodRoutes.post('/foods', createFood);

// Get all food items
FoodRoutes.get('/foods', getAllFoods);

// Get a specific food item by ID
FoodRoutes.get('/foods/:id', getFoodById);

// Update a food item
FoodRoutes.put('/foods/:id', updateFood);

// Delete a food item
FoodRoutes.delete('/foods/:id', deleteFood);

export default FoodRoutes;