import { pool } from "../Db/db.js";

// Function to insert a new diet plan
const createDietPlan = async ({ name, description, difficulty, diet_type, tags }) => {
  const query = `
    INSERT INTO diet_plans (name, description, difficulty, diet_type, tags)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [name, description, difficulty, diet_type, tags];
  
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Function to get all diet plans
const getAllDietPlans = async () => {
  const query = 'SELECT * FROM diet_plans;';
  const result = await pool.query(query);
  return result.rows;
};

// Function to get a diet plan by ID
const getDietPlanById = async (id) => {
  const query = 'SELECT * FROM diet_plans WHERE id = $1;';
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) {
    throw new Error('Diet plan not found');
  }
  return result.rows[0];
};

export { createDietPlan, getAllDietPlans, getDietPlanById };
