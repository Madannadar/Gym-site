import db from "../config/db.js";

// Function to add a food to a diet plan
export const addFoodToDietPlan = async ({ diet_plan_id, food_id, portion_size, meal_type }) => {
    // First, check if the food exists
    const foodCheckQuery = `
      SELECT EXISTS(SELECT 1 FROM foods WHERE id = $1) AS food_exists;
    `;
    const foodCheckResult = await db.query(foodCheckQuery, [food_id]);
    
    // If the food does not exist, throw an error
    if (!foodCheckResult.rows[0].food_exists) {
      throw new Error(`Food with ID ${food_id} does not exist`);
    }
  
    // If food exists, proceed with insertion
    const query = `
      INSERT INTO diet_plan_foods (diet_plan_id, food_id, portion_size, meal_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [diet_plan_id, food_id, portion_size, meal_type];
    
    const { rows } = await db.query(query, values);
    return rows[0];
  };

// Function to get all foods in a diet plan
export const getFoodsByDietPlanId = async (diet_plan_id) => {
  const query = `
    SELECT 
      dpf.id as diet_plan_food_id,
      dpf.portion_size,
      dpf.meal_type,
      f.*
    FROM diet_plan_foods dpf
    JOIN foods f ON dpf.food_id = f.id
    WHERE dpf.diet_plan_id = $1;
  `;
  
  const result = await db.query(query, [diet_plan_id]);
  return result.rows;
};

// Function to remove a food from a diet plan
export const removeFoodFromDietPlan = async (id) => {
  const query = 'DELETE FROM diet_plan_foods WHERE id = $1 RETURNING *;';
  const result = await db.query(query, [id]);
  
  if (result.rows.length === 0) {
    throw new Error('Diet plan food not found');
  }
  
  return result.rows[0];
};

// Function to update a food in a diet plan
export const updateDietPlanFood = async (id, updateData) => {
  const { portion_size, meal_type } = updateData;

  const query = `
    UPDATE diet_plan_foods 
    SET 
      portion_size = COALESCE($2, portion_size),
      meal_type = COALESCE($3, meal_type)
    WHERE id = $1
    RETURNING *;
  `;
  
  const values = [id, portion_size, meal_type];

  const result = await db.query(query, values);
  
  if (result.rows.length === 0) {
    throw new Error('Diet plan food not found');
  }
  
  return result.rows[0];
};