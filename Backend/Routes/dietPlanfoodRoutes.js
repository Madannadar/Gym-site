import express from 'express';
import {
    addFoodToDietPlan,
    getFoodsByDietPlanId,
    removeFoodFromDietPlan,
    updateDietPlanFood
} from '../controller/dietPlanFoodController.js'

const DietFood = express.Router();

// Add a food to a specific diet plan
DietFood.post('/diet-plans/:diet_plan_id/foods',addFoodToDietPlan);

// Get all foods in a specific diet plan
DietFood.get('/diet-plans/:diet_plan_id/foods',getFoodsByDietPlanId);

// Remove a specific food from a diet plan
DietFood.delete('/diet-plan-foods/:id',removeFoodFromDietPlan);

// Update a specific food in a diet plan
DietFood.put('/diet-plan-foods/:id',updateDietPlanFood);

export default DietFood;