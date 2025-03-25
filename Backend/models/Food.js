import { pool } from "../Db/db.js";

const createFood = async ({ name, description, calories, protein, carbs, fats, tags, food_type }) => {
  const query = `
    INSERT INTO foods (name, description, calories, protein, carbs, fats, tags, food_type)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const values = [name, description, calories, protein, carbs, fats, tags, food_type];
  
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Function to get all foods
const getAllFoods = async () => {
  const query = 'SELECT * FROM foods;';
  const result = await pool.query(query);
  return result.rows;
};

// Function to get a food by ID
const getFoodById = async (id) => {
  const query = 'SELECT * FROM foods WHERE id = $1;';
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) {
    throw new Error('Food not found');
  }
  return result.rows[0];
};

// Function to update a food item
const updateFood = async (id, foodData) => {
  const { 
    name, 
    description, 
    calories, 
    protein, 
    carbs, 
    fats, 
    tags, 
    food_type 
  } = foodData;

  const query = `
    UPDATE foods 
    SET 
      name = COALESCE($2, name),
      description = COALESCE($3, description),
      calories = COALESCE($4, calories),
      protein = COALESCE($5, protein),
      carbs = COALESCE($6, carbs),
      fats = COALESCE($7, fats),
      tags = COALESCE($8, tags),
      food_type = COALESCE($9, food_type)
    WHERE id = $1
    RETURNING *;
  `;
  
  const values = [
    id, 
    name, 
    description, 
    calories, 
    protein, 
    carbs, 
    fats, 
    tags, 
    food_type
  ];

  const result = await pool.query(query, values);
  
  if (result.rows.length === 0) {
    throw new Error('Food not found');
  }
  
  return result.rows[0];
};

// Function to delete a food item
const deleteFood = async (id) => {
  const query = 'DELETE FROM foods WHERE id = $1 RETURNING *;';
  const result = await pool.query(query, [id]);
  
  if (result.rows.length === 0) {
    throw new Error('Food not found');
  }
  
  return result.rows[0];
};

export {updateFood, getAllFoods, getFoodById, createFood, deleteFood };