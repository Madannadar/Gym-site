import db from "../config/db.js";

const recordDish = async (dishData) => {
  const {
    created_by,
    dish_name,
    calories,
    protein,
    fat,
    carbs,
    units,
    meal_type,
    is_vegetarian,
  } = dishData;

  const query = `
    INSERT INTO diet_dishes (
      created_by, dish_name, calories, protein, fat, carbs,
      units, meal_type, is_vegetarian
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;

  const values = [
    created_by || null,
    dish_name,
    calories,
    protein,
    fat,
    carbs,
    units || null,
    meal_type,
    is_vegetarian,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

const fetchAllDishes = async () => {
  const query = `
    SELECT * FROM diet_dishes
    ORDER BY created_at DESC;
  `;

  const result = await db.query(query);
  return result.rows;
};

const fetchDishById = async (dish_id) => {
  const query = `
    SELECT * FROM diet_dishes
    WHERE dish_id = $1;
  `;

  const values = [dish_id];
  const result = await db.query(query, values);
  return result.rows[0];
};

const updateDishById = async (dish_id, updateData) => {
  const {
    dish_name,
    calories,
    protein,
    fat,
    carbs,
    units,
    meal_type,
    is_vegetarian,
  } = updateData;

  const query = `
    UPDATE diet_dishes
    SET dish_name = $1,
        calories = $2,
        protein = $3,
        fat = $4,
        carbs = $5,
        units = $6,
        meal_type = $7,
        is_vegetarian = $8
    WHERE dish_id = $9
    RETURNING *;
  `;

  const values = [
    dish_name,
    calories,
    protein,
    fat,
    carbs,
    units,
    meal_type,
    is_vegetarian,
    dish_id,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteDishById = async (dish_id) => {
  const query = `
    DELETE FROM diet_dishes
    WHERE dish_id = $1
    RETURNING *;
  `;

  const values = [dish_id];
  const result = await db.query(query, values);
  return result.rows[0];
};

const fetchDishesByUserId = async (user_id) => {
  const query = `
    SELECT * FROM diet_dishes
    WHERE created_by = $1
    ORDER BY created_at DESC;
  `;

  const values = [user_id];
  const result = await db.query(query, values);
  return result.rows;
};

const deleteAllDishesByUserId = async (user_id) => {
  const query = `
    DELETE FROM diet_dishes
    WHERE created_by = $1
    RETURNING *;
  `;

  const values = [user_id];
  const result = await db.query(query, values);
  return result.rows;
};

export {
  recordDish,
  fetchAllDishes,
  fetchDishById,
  updateDishById,
  deleteDishById,
  fetchDishesByUserId,
  deleteAllDishesByUserId,
};
