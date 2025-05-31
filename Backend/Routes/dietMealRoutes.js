// import express from 'express';
// import DietMeal from '../models/DietMeal.js';

// const router = express.Router();

// // Add a meal to a diet plan
// router.post('/diet-meals', async (req, res) => {
//   const { diet_plan_id, food_id, meal_type, serving_size } = req.body;

//   try {
//     const newDietMeal = await DietMeal.addMealToDietPlan({
//       diet_plan_id,
//       food_id,
//       meal_type,
//       serving_size,
//     });
//     res.status(201).json(newDietMeal);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to add meal to diet plan' });
//   }
// });

// // Get all meals for a diet plan
// router.get('/diet-plans/:id/meals', async (req, res) => {
//   const { id } = req.params;

//   try {
//     const meals = await DietMeal.getMealsByDietPlanId(id);
//     res.status(200).json(meals);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to fetch meals' });
//   }
// });

// export default router;