// import mongoose from 'mongoose';

// const foodSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: { type: String, required: true },
//   calories: { type: Number, required: true },
//   protein: { type: Number, required: true },
//   carbs: { type: Number, required: true },
//   fats: { type: Number, required: true },
//   tags: { type: [String], default: [] },
//   food_type: { type: String, enum: ['Vegetarian', 'Non-Vegetarian'], required: true },
//   created_at: { type: Date, default: Date.now },
// });

// const Food = mongoose.model('Food', foodSchema);

// export default Food;

import { pool } from "../Db/db.js";

// Function to create a new food item
const createFood = async (foodData) => {
  const {
    name,
    description,
    calories,
    protein,
    carbs,
    fats,
    tags,
    food_type,
  } = foodData;

  const query = `
    INSERT INTO foods (name, description, calories, protein, carbs, fats, tags, food_type)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const values = [name, description, calories, protein, carbs, fats, tags, food_type];

  const result = await pool.query(query, values);
  return result.rows[0];
};



export default { createFood };