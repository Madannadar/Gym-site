// import { pool } from "../Db/db.js";

// // Function to add a meal to a diet plan
// const addMealToDietPlan = async (dietMealData) => {
//   const { diet_plan_id, food_id, meal_type, serving_size } = dietMealData;

//   const query = `
//     INSERT INTO diet_meals (diet_plan_id, food_id, meal_type, serving_size)
//     VALUES ($1, $2, $3, $4)
//     RETURNING *;
//   `;
//   const values = [diet_plan_id, food_id, meal_type, serving_size];

//   const result = await pool.query(query, values);
//   return result.rows[0];
// };

// // Function to get all meals for a diet plan
// const getMealsByDietPlanId = async (diet_plan_id) => {
//   const query = `
//     SELECT dm.*, f.name AS food_name, f.calories, f.protein, f.carbs, f.fats
//     FROM diet_meals dm
//     JOIN foods f ON dm.food_id = f.id
//     WHERE dm.diet_plan_id = $1;
//   `;
//   const result = await pool.query(query, [diet_plan_id]);
//   return result.rows;
// };

// export default { addMealToDietPlan, getMealsByDietPlanId };