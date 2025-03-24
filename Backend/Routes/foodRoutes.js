// import express from 'express';
// import Food from '../model/Food.js';

// const router = express.Router();

// // Route to create a new food item
// router.post('/foods', async (req, res) => {
//   const {
//     name,
//     description,
//     calories,
//     protein,
//     carbs,
//     fats,
//     tags,
//     food_type,
//   } = req.body;

//   try {
//     // Create a new food item
//     const newFood = new Food({
//       name,
//       description,
//       calories,
//       protein,
//       carbs,
//       fats,
//       tags,
//       food_type,
//     });

//     // Save the food item to the database
//     await newFood.save();

//     // Return the created food item
//     res.status(201).json(newFood);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to create food item' });
//   }
// });

// export default router;


import express from 'express';
import Food from '../models/Food.js';

const router = express.Router();

// Route to create a new food item
router.post('/foods', async (req, res) => {
  const {
    name,
    description,
    calories,
    protein,
    carbs,
    fats,
    tags,
    food_type,
  } = req.body;

  try {
    // Create a new food item
    const newFood = await Food.createFood({
      name,
      description,
      calories,
      protein,
      carbs,
      fats,
      tags,
      food_type,
    });

    // Return the created food item
    res.status(201).json(newFood);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create food item' });
  }
});

export default router;
